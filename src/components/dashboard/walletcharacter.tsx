import { Card } from '@/components/ui/card';
import { useRef } from "react";
import ScreenshotCard from './screenshotcard';
import domtoimage from 'dom-to-image-more';
import { useToast } from "@/hooks/use-toast";
//import axios from "axios";
//import { CircleCheckBigIcon } from 'lucide-react'; useState useEffect

interface WalletCharacterProps {
  score: number;
  frequentTxs?: number;
  impulsiveTxs?: number;
}

const WalletCharacter = ({ score, frequentTxs, impulsiveTxs }: WalletCharacterProps) => {
  const getCharacter = (score: number) => {
    if (score <= 40) {
      return {
        emoji: "/zen_holder_two.png",
        name: "Zen Holder",
        description: "Disciplined and wise with money",
        color: "from-green-500 to-emerald-600",
        message: "You're crushing it! Your patience is paying off.",
        traits: ["Diamond Hands", "Risk Aware", "Long-term Thinker"],
        tweetEmoji: "🧘‍♂️"
      };
    } else if (score <= 80) {
      return {
        emoji: "/curious_ape_two.png",
        name: "Curious Ape",
        description: "Learning and improving",
        color: "from-yellow-500 to-orange-500",
        message: "You're on the right track! Small changes = big gains.",
        traits: ["Quick Learner", "Adaptable", "Growth Mindset"],
        tweetEmoji: "🧐"
      };
    } else {
      return {
        emoji: "/degen_ape_two.png",
        name: "Degen Ape",
        description: "Needs guidance and discipline",
        color: "from-red-500 to-pink-500",
        message: "Time to level up! Every expert was once a beginner.",
        traits: ["High Energy", "Risk Taker", "Potential for Growth"],
        tweetEmoji: "🤪"
      };
    }
  };

  const character = getCharacter(score);
  const { toast } = useToast()
  // const [ showModal, setShowModal ] = useState<boolean>(false)
  // const [countdown, setCountdown] = useState(3);


  const screenshotRef = useRef<HTMLDivElement>(null);
  
  // const handleShare = async () => {
  //   if(screenshotRef.current){
  //     try {
  //       const dataUrl = await domtoimage.toPng(screenshotRef.current, {
  //       quality: 1,
  //       backgroundColor: "#1a1a2e",
  //     });
  //       const link = document.createElement("a");
  //       link.href = dataUrl;
  //       link.download = `${character.name}-wallet-score.png`;
  //       link.click();

  //       setCountdown(3);
  //       setShowModal(true)

  //     } catch (error) {
  //       console.error("Failed to download and share:", error)
  //       toast({
  //         title: "Something went wrong while sharing",
  //         description: "Please try again"
  //       })
  //     }
  //   }
  // };

    const handleShare = async () => {
    if(screenshotRef.current){
      try {
        const dataUrl = await domtoimage.toPng(screenshotRef.current, {
        quality: 1,
        backgroundColor: "#1a1a2e",
      });
        localStorage.setItem("fvp-wallet-tweet-image", dataUrl);
        localStorage.setItem("fvp-wallet-tweet-pending", "true");

        // Start OAuth login
        window.location.href = "http://fvp.finance/api/twitter/login";
      } catch (error) {
        console.error("Failed to download and share:", error)
        toast({
          title: "Something went wrong while sharing",
          description: "Please try again"
        })
      }
    }
  };

  // useEffect(() => {
  //   if(!showModal) return;

  //   if(countdown === 0){
  //     const tweetText = encodeURIComponent(
  //       `Just got my Wallet Score from fvp.finance 💸\n\n I'm a ${character.name}${character.tweetEmoji}! \n Find out your crypto trading personality today!\n`
  //     );
  //     const hashtags = "FVP,WalletScore,DeFi";
  //     const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}&hashtags=${hashtags}`;
  //     window.open(tweetUrl, "_blank");
  //     setShowModal(false);
  //     return
  //   }

  //   const interval = setInterval(() => {
  //     setCountdown((prev) => prev - 1);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [showModal, countdown])

    // useEffect(() => {
    //   const image = localStorage.getItem("fvp-wallet-tweet-image");
    //   const shouldPost = localStorage.getItem("fvp-wallet-tweet-pending") === "true";

    //   if (!image || !shouldPost) return;

    //   const postTweet = async () => {  
    //     const text = `Just got my Wallet Score from fvp.finance 💸\n\n I'm a ${character.name}${character.tweetEmoji}! \n Find out your crypto trading personality today!\n #FVP #DeFi`;
    //     const base64Image = image.split(",")[1];
  
    //     try {
    //       const res = await axios.post("http://fvp.finance/api/twitter/tweet", {
    //         text,
    //         image: base64Image,
    //       }, {
    //           withCredentials: true,
    //       });
  
    //     if (res.data?.tweet?.data?.id && res.data?.screen_name) {
    //       localStorage.removeItem("fvp-wallet-tweet-image");
    //       localStorage.removeItem("fvp-wallet-tweet-pending");
    //       const tweetUrl = `https://twitter.com/${res.data.screen_name}/status/${res.data.tweet.data.id}`;
    //       window.location.href = tweetUrl;
    //     }
    //     } catch (err) {
    //       console.error("Failed to post tweet", err);
    //     }
    //   };
  
    //   postTweet();
    // }, []);


  return (
    <>
    <Card className={`border-purple-500/20 p-6 text-center`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex justify-center items-center">
          <div className="w-72 h-72 rounded-full">
            <img
                src={character?.emoji}
                alt="img"
                className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">You Are A, {character?.name}</h2>
          <p className="text-gray-300 mb-4">{character?.description}</p>
          <div className={`flex flex-col font-bold bg-gradient-to-r ${character?.color} bg-clip-text text-transparent mb-4`}>
            <span className='text-xl'>Wallet Score</span>
            <span className='text-4xl'>{score}</span>
          </div>
          <p className="text-purple-200 text-lg font-medium mb-4">"{character?.message}"</p>
          <div className="flex flex-wrap justify-center gap-2">
            {character?.traits.map((trait, index) => (
              <span key={index} className="px-3 py-1 bg-purple-500/30 rounded-full text-purple-200 text-sm">
                {trait}
              </span>
            ))}
          </div>
          <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <p>
              <span className='text-green-600 font-bold text-lg font-mono'>Frequent Txs: </span>
              <span className='font-bold text-lg font-mono'>{frequentTxs || 0}</span>
            </p>
            <p>
              <span className='text-purple-600 font-bold text-lg font-mono'>Impulsive Txs: </span>
              <span className='font-bold text-lg font-mono'>{impulsiveTxs || 0}</span>
            </p>
          </div>
          <p className="py-1 text-gray-500 italic text-sm">
            Wallet Score = (Frequent Txs * 2) + (Impulsive Txs * 3)
          </p>
          <button
           className="px-8 hidden py-2 mt-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md hover:scale-95 font-semibold"
           onClick={handleShare}
          >
            Share on X
          </button>
        </div>
      </div>
    </Card>
     {/* Hidden screenshot card */}
    <ScreenshotCard
      ref={screenshotRef}
      emoji={character.emoji}
      name={character.name}
      score={score}
      message={character.message}
    />
    </>
  );
};

export default WalletCharacter;

    // {showModal && (
    //   <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
    //     <div className="bg-gray-900 p-6 rounded-lg max-w-sm w-full">
    //       <div className='flex flex-col items-center gap-y-3 justify-center'>
    //         <CircleCheckBigIcon className='text-green-500' size={36}/>
    //         <h3 className="font-bold text-lg">Image Downloaded!</h3>
    //       </div>
    //       <p className="py-4 text-gray-400">
    //         You're being redirected to X (Twitter) in <strong>{countdown}</strong>.
    //       </p>
    //       {/* <div className="flex justify-end">
    //         <button
    //           className="btn btn-sm btn-primary"
    //           onClick={() => setShowModal(false)}
    //         >
    //           Close
    //         </button>
    //       </div> */}
    //     </div>
    //   </div>
    // )}