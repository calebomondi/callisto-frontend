import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Clock, ChartBar, Wallet } from "lucide-react";

const solutions = [
  {
    id: "vault",
    title: "Secure Vault",
    description: "Lock your assets in a secure, time-locked vault",
    icon: <Lock className="w-6 h-6" />,
    preview: (
      <div className="light:bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">ETH Vault</h3>
            <p className="text-sm text-gray-600">Locked for 6 months</p>
          </div>
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        <div className="space-y-4">
          <div className="light:bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium">Amount Locked</p>
            <p className="text-2xl font-bold">10.5 ETH</p>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Unlock Date</span>
            <span>Oct 15, 2024</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "schedule",
    title: "Unlock Schedule",
    description: "Create custom unlock schedules for your assets",
    icon: <Clock className="w-6 h-6" />,
    preview: (
      <div className="light:bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Unlock Schedule</h3>
            <p className="text-sm text-gray-600">3-month intervals</p>
          </div>
          <Clock className="w-8 h-8 text-orange-500" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 light:bg-orange-50 rounded-lg"
            >
              <div>
                <p className="font-medium">Phase {i}</p>
                <p className="text-sm text-gray-600">3.5 ETH</p>
              </div>
              <p className="text-sm text-gray-600">Month {i * 3}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "analytics",
    title: "Asset Analytics",
    description: "Track your locked assets and upcoming unlocks",
    icon: <ChartBar className="w-6 h-6" />,
    preview: (
      <div className="light:bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Portfolio Overview</h3>
            <p className="text-sm text-gray-600">Total Value Locked</p>
          </div>
          <ChartBar className="w-8 h-8 text-orange-500" />
        </div>
        <div className="space-y-4">
          <div className="h-32 light:bg-orange-50 rounded-lg flex items-end p-4">
            {[40, 65, 45, 80, 55, 70].map((height, i) => (
              <div
                key={i}
                className="flex-1 mx-1"
                style={{ height: `${height}%` }}
              >
                <div className="bg-orange-500 h-full rounded-t-lg" />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Last 6 Months</span>
            <span>$250,000 TVL</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "management",
    title: "Vault Management",
    description: "Manage multiple vaults and assets easily",
    icon: <Wallet className="w-6 h-6" />,
    preview: (
      <div className="light:bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Active Vaults</h3>
            <p className="text-sm text-gray-600">4 Vaults</p>
          </div>
          <Wallet className="w-8 h-8 text-orange-500" />
        </div>
        <div className="space-y-3">
          {["ETH Vault", "USDC Vault", "UNI Vault", "LINK Vault"].map(
            (vault) => (
              <div
                key={vault}
                className="flex items-center justify-between p-3 light:bg-orange-50 rounded-lg"
              >
                <span className="font-medium">{vault}</span>
                <Button variant="ghost" size="sm" className="text-orange-500">
                  Manage
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    ),
  },
];

export default function Solutions() {
  const [activeTab, setActiveTab] = useState("vault");

  const activeSolution = solutions.find((s) => s.id === activeTab);

  return (
    <section className="py-20 px-24 light:bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Solutions
          </motion.h2>
          <motion.p
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Comprehensive tools to help you manage and secure your crypto assets
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {solutions.map((solution) => (
                <Button
                  key={solution.id}
                  variant={activeTab === solution.id ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    activeTab === solution.id
                      ? "bg-orange-500 hover:bg-orange-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab(solution.id)}
                >
                  {solution.icon}
                  {solution.title}
                </Button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="light:bg-gray-50 p-6 rounded-xl"
            >
              <h3 className="text-2xl font-semibold mb-3">
                {activeSolution?.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeSolution?.description}
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Learn More
              </Button>
            </motion.div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:sticky lg:top-24"
          >
            {activeSolution?.preview}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
