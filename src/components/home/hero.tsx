import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import overallDashboard from '/overall_dashboard.png'
//import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { useNavigate } from "react-router-dom";
import { BackgroundGradient } from "../ui/background-gradient";

export default function Hero() {

    const navigate = useNavigate()

    const handleDash = () => {
        navigate("/dashboard");
    }

    return (
      <section className="pt-16 md:pt-24 sm:px-5 md:px-10 lg:px-10" id="hero">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col mb-8 items-center justify-center space-y-4"
            >
              <h2 className="max-w-4xl mx-auto text-3xl md:text-4xl lg:text-6xl font-bold text-center pt-12">
                Manage Your Crypto Assets, Invest In Your Future
              </h2>
              {/* 
              <p className="max-w-xl text-lg dark:text-gray-400 text-center">
                Create Virtual Vaults For Locking Your Crypto assets And Curb Your Impulsive Spending Behaviour, Build Your Long Term Investment
              </p>
              */}
              <p className="text-center text-purple-400 text-2xl font-bold">
                Earn Yields of Upto 5% and redeemable points on every vault.
              </p>
              <Button onClick={handleDash} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-95 text-base px-12 py-6 rounded-3xl mb-2">
                Let's Get You Started
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-6xl mx-auto"
            >
                <BackgroundGradient className="rounded-lg">
                  <img
                    src={overallDashboard}
                    alt="Crypto Vault Illustration"
                    className="w-full h-full object-contain p-2 rounded-md"
                  />
                </BackgroundGradient>
            </motion.div>
          </div>
        </div>
      </section>
    )
}
