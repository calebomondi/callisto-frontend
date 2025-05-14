import { motion } from "framer-motion";

export default function TrustedBy() {
    return (
        <section className="py-12 light:bg-gray-50 px-24">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600 mb-8 font-semibold">TRUSTED BY</p>
          <motion.div
            className="flex justify-center items-center gap-12 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              width={100}
              height={100}
              src="/aave-logo.png"
              alt="Aave"
              className=" opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              width={100}
              height={100}
              src="/uniswap-logo.png"
              alt="Uniswap"
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              width={100}
              height={100}
              src="/ethereum-logo.png"
              alt="Ethereum"
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
            <img
              width={100}
              height={100}
              src="/base-logo.png"
              alt="Base"
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          </motion.div>
        </div>
      </section>
    )
}
