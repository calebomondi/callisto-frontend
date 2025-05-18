import { motion } from "framer-motion";
import { DollarSign, Users, Lock, Activity } from "lucide-react";

const stats = [
  {
    title: "Total Value Locked",
    value: "$12.5M+",
    description: "Total assets secured in our smart contracts",
    icon: <DollarSign className="w-6 h-6" />,
    prefix: "$",
  },
  {
    title: "Active Users",
    value: "15,000+",
    description: "Trusted by thousands of crypto savers worldwide",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Successful Locks",
    value: "45,000+",
    description: "Successfully completed savings goals",
    icon: <Lock className="w-6 h-6" />,
  },
  {
    title: "Uptime",
    value: "99.99%",
    description: "Reliable platform performance and availability",
    icon: <Activity className="w-6 h-6 text-amber-500" />,
  },
];

export default function Stats() {
  return (
    <section className="py-20 px-24 light:bg-gray-50" id="stats">
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-navy mb-4">
          Platform Statistics
        </h2>
        <p className="dark:text-gray-300 max-w-2xl mx-auto">
          Our platform's growth and performance metrics showcase our commitment to providing a secure and reliable savings solution for the crypto community.
        </p>
      </div>
      <div className="container mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="light:bg-white rounded-xl p-6 shadow-lg"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                },
              }}
              whileHover={{
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <div className="text-amber-500">{stat.icon}</div>
                </div>
                <h3 className="text-lg font-semibold">{stat.title}</h3>
              </div>

              <div className="space-y-2">
                <motion.p
                  className="text-4xl font-bold text-amber-500"
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1,
                  }}
                >
                  {stat.value}
                </motion.p>
                <p className="dark:text-gray-400">{stat.description}</p>
              </div>

              <motion.div
                className="mt-4 h-1 bg-amber-100 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1, delay: index * 0.2 }}
              >
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: "70%" }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


