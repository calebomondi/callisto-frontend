import { StickyScroll } from "../ui/sticky-scroll-reveal";
import vaultDashboard from "/vault_dashboard.png";
import { motion } from "framer-motion"
const content = [
  {
    title: "Secure Vault",
    description:
      "Lock your assets in a secure, time-locked vault",
    content: (
      <div>
        <img
          src={vaultDashboard}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
    {
    title: "Wallet Analytics",
    description:
      "Track ypur locked assets and upcoming unlocks",
    content: (
      <div>
        <img
          src="/analytics_dashboard.png"
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Vault Management",
    description:
      "Manage multiple vaults and assets easily",
    content: (
      <div>
        <img
          src={vaultDashboard}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Unlock Schedule",
    description:
      "Create custom unlock schedules for your assets",
    content: (
      <div>
        <img
          src={vaultDashboard}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
];
export function StickyScrollRevealDemo() {
  return (
    <div className="w-full py-4">
        <div className="text-center">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Solutions
          </motion.h2>
          <motion.p
            className="dark:text-gray-400 max-w-2xl mx-auto md:px-4 px-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Comprehensive tools to help you manage and secure your crypto assets
          </motion.p>
        </div>
      <StickyScroll content={content} />
    </div>
  );
}
