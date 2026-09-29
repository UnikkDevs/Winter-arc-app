//
//  WinterArcApp.swift
//  Winter Arc 2026 - Native iOS SwiftUI + HealthKit Wrapper
//
//  Created for Winter Arc 2026
//

import SwiftUI
import WebKit
import HealthKit

@main
struct WinterArcApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
                .ignoresSafeArea()
        }
    }
}

// MARK: - HealthKit Manager
class HealthKitManager: ObservableObject {
    let healthStore = HKHealthStore()
    @Published var isAuthorized = false
    @Published var todaySteps: Int = 0
    @Published var lastNightSleepDurationHours: Double = 0.0

    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(false)
            return
        }

        guard let stepType = HKObjectType.quantityType(forIdentifier: .stepCount),
              let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis),
              let activeEnergy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned),
              let workoutType = HKObjectType.workoutType() else {
            completion(false)
            return
        }

        let readTypes: Set<HKObjectType> = [stepType, sleepType, activeEnergy, workoutType]

        healthStore.requestAuthorization(toShare: [], read: readTypes) { success, error in
            DispatchQueue.main.async {
                self.isAuthorized = success
                if success {
                    self.fetchTodaySteps()
                    self.fetchLastNightSleep()
                }
                completion(success)
            }
        }
    }

    func fetchTodaySteps(completion: ((Int) -> Void)? = nil) {
        guard let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else { return }

        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: Date(), options: .strictStartDate)

        let query = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, _ in
            var steps = 0
            if let sum = result?.sumQuantity() {
                steps = Int(sum.doubleValue(for: HKUnit.count()))
            }
            DispatchQueue.main.async {
                self.todaySteps = steps
                completion?(steps)
            }
        }
        healthStore.execute(query)
    }

    func fetchLastNightSleep(completion: ((Double) -> Void)? = nil) {
        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else { return }

        let calendar = Calendar.current
        let now = Date()
        guard let yesterday = calendar.date(byAdding: .day, value: -1, to: now) else { return }

        let predicate = HKQuery.predicateForSamples(withStart: yesterday, end: now, options: .strictEndDate)
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: 30, sortDescriptors: [sortDescriptor]) { _, samples, _ in
            guard let sleepSamples = samples as? [HKCategorySample] else { return }

            var totalSleepSeconds: TimeInterval = 0
            for sample in sleepSamples {
                // In iOS 16+, asleep core/deep/REM counts toward actual sleep
                if sample.value == HKCategoryValueSleepAnalysis.asleepCore.rawValue ||
                   sample.value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue ||
                   sample.value == HKCategoryValueSleepAnalysis.asleepREM.rawValue ||
                   sample.value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue {
                    totalSleepSeconds += sample.endDate.timeIntervalSince(sample.startDate)
                }
            }

            let hours = totalSleepSeconds / 3600.0
            DispatchQueue.main.async {
                self.lastNightSleepDurationHours = hours
                completion?(hours)
            }
        }
        healthStore.execute(query)
    }
}

// MARK: - Main ContentView with WKWebView Bridge
struct ContentView: View {
    @StateObject private var healthKit = HealthKitManager()
    @State private var webView = WKWebView()

    // Host URL of your deployed Winter Arc PWA or local bundle
    let appURL = URL(string: "https://ais-dev-rsynf57mhsatt4s3zzvh5n-439442445610.asia-east1.run.app")!

    var body: some View {
        ZStack {
            Color(red: 7/255, green: 9/255, blue: 14/255)
                .ignoresSafeArea()

            WebViewWrapper(url: appURL, healthKit: healthKit)
                .ignoresSafeArea(.container, edges: .all)
        }
        .onAppear {
            healthKit.requestAuthorization { granted in
                print("HealthKit access granted: \(granted)")
            }
        }
    }
}

// MARK: - WKWebView UIViewRepresentable with JavaScript Bridge
struct WebViewWrapper: UIViewRepresentable {
    let url: URL
    let healthKit: HealthKitManager

    func makeCoordinator() -> Coordinator {
        Coordinator(healthKit: healthKit)
    }

    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "healthKitBridge")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 7/255, green: 9/255, blue: 14/255, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        context.coordinator.webView = webView

        let request = URLRequest(url: url)
        webView.load(request)
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKScriptMessageHandler {
        let healthKit: HealthKitManager
        weak var webView: WKWebView?

        init(healthKit: HealthKitManager) {
            self.healthKit = healthKit
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "healthKitBridge", let body = message.body as? [String: Any] else { return }

            let action = body["action"] as? String

            if action == "requestSync" {
                healthKit.fetchTodaySteps { steps in
                    self.healthKit.fetchLastNightSleep { sleepHours in
                        let js = "window.__onHealthKitSync && window.__onHealthKitSync({ steps: \(steps), sleepHours: \(sleepHours) });"
                        self.webView?.evaluateJavaScript(js, completionHandler: nil)
                    }
                }
            }
        }
    }
}
