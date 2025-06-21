import { Card } from '@/components/ui/card';

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
        traits: ["Diamond Hands", "Risk Aware", "Long-term Thinker"]
      };
    } else if (score <= 80) {
      return {
        emoji: "/curious_ape_two.png",
        name: "Curious Ape",
        description: "Learning and improving",
        color: "from-yellow-500 to-orange-500",
        message: "You're on the right track! Small changes = big gains.",
        traits: ["Quick Learner", "Adaptable", "Growth Mindset"]
      };
    } else {
      return {
        emoji: "/degen_ape_two.png",
        name: "Degen Ape",
        description: "Needs guidance and discipline",
        color: "from-red-500 to-pink-500",
        message: "Time to level up! Every expert was once a beginner.",
        traits: ["High Energy", "Risk Taker", "Potential for Growth"]
      };
    }
  };

  const character = getCharacter(score);

  return (
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
        </div>
      </div>
    </Card>
  );
};

export default WalletCharacter;