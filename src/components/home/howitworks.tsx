import { motion } from "framer-motion";
import { Wallet, Lock, Clock, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

const steps = [
  {
    icon: <Wallet className="w-8 h-8" />,
    title: "Connect Wallet",
    description:
      "Connect your Web3 wallet to get started with securing your assets",
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Create a Vault",
    description: "Choose the assets you want to lock and create a secure vault",
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Set Lock Period",
    description: "Define your lock duration and optional unlock schedule on your terms",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
};

export default function HowItWorks() {
  return (
    <section className="py-20 " id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Get started with FVKRY PRVNTA in three simple steps
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={itemVariants}
            >
              <div className="border border-gray-800 hover:border-purple-500 rounded-xl p-8 text-center relative">
                <motion.div
                  className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <div className="text-purple-500">{step.icon}</div>
                </motion.div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>

                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="flex justify-end ">
            <a href="/documentation">
                <Button className="bg-transaprent hover:bg-gray-600">
                    Learn More <ArrowRight />
                </Button>
            </a>
        </div>
      </div>
      
    </section>
  );
}
