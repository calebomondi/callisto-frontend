import { Card } from '@/components/ui/card';
import { Button } from '../ui/button';

interface WalletCharacterProps {
  score: number;
  personalityType?: string;
}

const WalletCharacter = ({ score }: WalletCharacterProps) => {
  const getCharacter = (score: number) => {
    if (score >= 80) {
      return {
        emoji: "/zen_holder.png",
        name: "Zen Holder",
        description: "Disciplined and wise with money",
        color: "from-green-500 to-emerald-600",
        message: "You're crushing it! Your patience is paying off.",
        traits: ["Diamond Hands", "Risk Aware", "Long-term Thinker"]
      };
    } else if (score >= 50) {
      return {
        emoji: "/curious_ape.png",
        name: "Curious Ape",
        description: "Learning and improving",
        color: "from-yellow-500 to-orange-500",
        message: "You're on the right track! Small changes = big gains.",
        traits: ["Quick Learner", "Adaptable", "Growth Mindset"]
      };
    } else {
      return {
        emoji: "/degen_ape.png",
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
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-60 h-60 rounded-full mb-4">
            <img
                src={character.emoji}
                alt="img"
                className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{character.name}</h2>
          <p className="text-gray-300 mb-4">{character.description}</p>
          <div className={`text-4xl font-bold bg-gradient-to-r ${character.color} bg-clip-text text-transparent mb-4`}>
            {score}/100
          </div>
          <p className="text-purple-200 text-lg font-medium mb-4">"{character.message}"</p>
          <div className="flex flex-wrap justify-center gap-2">
            {character.traits.map((trait, index) => (
              <span key={index} className="px-3 py-1 bg-purple-500/30 rounded-full text-purple-200 text-sm">
                {trait}
              </span>
            ))}
          </div>
          <div className="mt-3">
            <a href="">
                <Button>
                    Share on X
                </Button>
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WalletCharacter;