import { motion } from "framer-motion";
import {
  Lock,
  Clock,
  Shield,
  ChartBar,
  Wallet,
  Blocks
} from "lucide-react";

const features = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Secure Asset Locking",
    description: "Lock your ETH and ERC20 tokens in secure smart contracts with customizable time periods"
  },
  {
    icon: <Shield className="w-8 h-8 light:text-amber-500" />,
    title: "Audited Security",
    description: "Smart contracts audited by leading security firms ensuring your assets are protected"
  },
  {
    icon: <Clock className="w-8 h-8 light:text-amber-500" />,
    title: "Flexible Time Locks",
    description: "Choose your lock duration from 1 day to 5 years with automatic unlocking"
  },
  {
  icon: <Wallet className="w-8 h-8 light:text-amber-500" />,
  title: "Multi-Token Support",
  description: "Support for ETH and major ERC20 tokens with more assets coming soon"
  },
  {
    icon: <ChartBar className="w-6 h-6" />,
    title: "Unlock Schedule",
    description:
      "Set up scheduled unlocks to portion out your assets over time",
  },
  {
    icon: <Blocks className="w-6 h-6" />,
    title: "Aave Integration",
    description: "Locked assets are supplied to Aave for yield generation",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function Features() {
  return (
    <section className="py-20 px-24 light:bg-gray-50" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Key Features
          </motion.h2>
          <motion.p
            className="dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to secure your crypto assets and maintain
            financial discipline
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="light:bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 light:bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-amber-500">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-400">{feature.title}</h3>
              <p className="dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
