import { motion } from "framer-motion";
import { Shield, TrendingUp, Clock, Wallet } from "lucide-react";

const benefits = [
  {
    title: "Enhanced Security",
    description: "Your assets are secured by smart contracts on the Ethereum blockchain",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    title: "Better Returns",
    description: "Avoid panic selling and benefit from long-term market growth",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    title: "Time-Locked Savings",
    description: "Set custom lock periods to match your financial goals",
    icon: <Clock className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    title: "Financial Discipline",
    description: "Build better crypto investment habits with controlled access",
    icon: <Wallet className="w-6 h-6" />,
    color: "bg-orange-500",
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

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function Benefits() {
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
            Why Choose FVKRY PRVNTA?
          </motion.h2>
          <motion.p
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Experience the advantages of our secure asset locking platform
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="relative group"
              variants={cardVariants}
            >
              <div className="absolute inset-0 rounded-xl transform group-hover:scale-105 transition-transform duration-300" />

              <div className="relative light:bg-white rounded-xl p-6 shadow-lg border border-orange-100 h-full">
                <div className="mb-4">
                  <motion.div
                    className={`w-12 h-12 ${benefit.color} bg-opacity-10 rounded-lg flex items-center justify-center`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={`text-${benefit.color.split("-")[1]}-500`}>
                      {benefit.icon}
                    </div>
                  </motion.div>
                </div>

                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>

                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-b-xl"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-600 italic">
            {`Join thousands of users who have already secured their crypto
            assets with FVKRY PRVNTA`}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
