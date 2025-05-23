import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import vault from '/vault.png'
//import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { useNavigate } from "react-router-dom";

export default function Hero() {

    const navigate = useNavigate()

    const handleDash = () => {
        navigate("/documentation");
    }
    {/*}
    const words = [
        {
        text: "Manage",
        className: "text-amber-500 dark:text-amber-500"
        },
        {
        text: "Your",
        className: "text-amber-500"
        },
        {
        text: "Crypto",
        className: "text-amber-500"
        },
        {
        text: "Assets, ",
        className: "text-amber-500"
        },
        {
        text: "Build",
        className: "text-amber-500"
        },
        {
        text: "Your Future",
        className: "text-amber-500"
        },
        
    ];
*/}
    return (
      <section className="pt-16 md:pt-24 sm:px-5 md:px-10 lg:px-10" id="hero">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-12 items-between ">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-5 items-center flex flex-col justify-center"
            >
            {/*}
            <TypewriterEffectSmooth
                className="font-bold flex justify-center my-2 hidden md:flex tracking-tight flex-wrap w-full"
                words={words}
                cursorClassName="bg-amber-500 my-auto"
            />
            */}
            <h2 className="text-4xl font-bold text-center mb-4">
              Manage Your Crypto Assets, Build Your Future
            </h2>
              <p className="text-lg dark:text-gray-400  mb-8 text-center">
                Create Virtual Vaults For Locking Your Crypto assets And Curb Your Impulsive Spending Behaviour, Build Your Long Term Investment
              </p>
              <div className="flex gap-6 mb-12 justify-center text-amber-500 font-italic">
                <p className="text-center">Integrated With Aave, Your Locked Assets Yield Interest</p>
              </div>
              <div className="flex justify-center">
                <Button onClick={handleDash} className="bg-amber-500 hover:bg-amber-500 text-lg px-5 py-4">
                  Let's Get You Started
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative items-center flex justify-center"
            >
              <div className="relative w-full h-[400px] md:h-[500px]">
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
                    className="w-full h-full object-contain sm:p-4 md:p-6 lg:p-8"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
}
