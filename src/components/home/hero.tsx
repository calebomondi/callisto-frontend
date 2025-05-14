import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import vault from '/vault.png'

export default function Hero() {
    return (
        <section className="pt-32 pb-20 px-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                Secure your
                <span className="relative">
                  <span className="relative z-10"> crypto assets</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-3 bg-orange-300 -z-10"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Avoid Impulsive Spending And Trading By Locking Your Crypto
                Assets
              </p>
              <div className="flex gap-6 mb-12">
                <div>
                  <h3 className="text-3xl font-bold">$100k</h3>
                  <p className="text-gray-600">Funds Locked</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold">100+</h3>
                  <p className="text-gray-600">Active Users</p>
                </div>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                Get Started
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-[500px]">
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{
                    scale: [1, 1.02, 1],
                    rotate: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <img
                    src={vault}
                    alt="Crypto Vault Illustration"
                    className="w-full h-full object-contain p-8"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
}
