import { Card } from '@/components/ui/card';
import { Clock, TrendingUp, Shield, PieChart } from 'lucide-react';

interface ScoreBreakdownProps {
  scores: {
    discipline: number;
    trading: number;
    risk: number;
    safety: number;
    total: number;
  };
}

const ScoreBreakdown = ({ scores }: ScoreBreakdownProps) => {
  const categories = [
    {
      name: "Frequent Transactions",
      score: scores.discipline,
      maxScore: 35,
      icon: <Clock className="w-5 h-5" />,
      description: "How long you hold your tokens",
      iconColor: "text-blue-400"
    },
    {
      name: "Impulsive Transactions",
      score: scores.trading,
      maxScore: 30,
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Trading frequency and success rate",
      iconColor: "text-green-400"
    },
    {
      name: "Risk Management",
      score: scores.risk,
      maxScore: 20,
      icon: <Shield className="w-5 h-5" />,
      description: "Memecoin vs stablecoin balance",
      iconColor: "text-orange-400"
    },
    {
      name: "Diversification",
      score: scores.safety,
      maxScore: 15,
      icon: <PieChart className="w-5 h-5" />,
      description: "Variety of tokens in portfolio",
      iconColor: "text-purple-400"
    }
  ];

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "from-green-400 to-emerald-500";
    if (percentage >= 60) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-pink-500";
  };

  const getScoreRating = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { text: "LEGENDARY", color: "text-yellow-400" };
    if (percentage >= 80) return { text: "EXCELLENT", color: "text-green-400" };
    if (percentage >= 60) return { text: "GOOD", color: "text-blue-400" };
    if (percentage >= 40) return { text: "FAIR", color: "text-orange-400" };
    return { text: "NEEDS WORK", color: "text-red-400" };
  };


  return (
    <Card className="border-purple-500/20 p-6">
      <h3 className="text-white text-lg font-semibold mb-6">Score Breakdown</h3>
      <div className="space-y-6">
        {categories.map((category, index) => {
           const rating = getScoreRating(category.score, category.maxScore);
           const percentage = (category.score / category.maxScore) * 100;

            return  (
            <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`p-2 rounded-lg bg-white/10 ${category.iconColor} group-hover:scale-110 transition-transform duration-300`}>{category.icon}</span>
                <span className="text-white font-medium">{category.name}</span>
              </div>
              <span className={`font-bold ${getScoreColor(category.score, category.maxScore)}`}>
                {category.score}/{category.maxScore}
              </span>
            </div>
           {/* Progress bar */}
           <div className="relative mb-2">
             <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
               <div 
                 className={`h-full bg-gradient-to-r ${getProgressColor(category.score, category.maxScore)} transition-all duration-1000 ease-out rounded-full relative`}
                 style={{ width: `${percentage}%` }}
               >
                 {/* Animated shimmer effect */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
               </div>
             </div>
           </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs">{category.description}</p>
              <span className={`text-xs font-bold ${rating.color}bg-black/20 px-2 py-1 rounded`}>
                {rating.text}
              </span>
            </div>
          </div>
            )
        }

        )}
      </div>
    </Card>
  );
};

export default ScoreBreakdown;


    //           <Card className="border-purple-500/20 p-6 backdrop-blur-sm">
    //   <div className="flex items-center justify-between mb-6">
    //     <h3 className="text-white text-xl font-bold">Score Breakdown</h3>
    //     <div className="text-purple-300 text-sm bg-purple-500/20 px-3 py-1 rounded-full">
    //       Total: 10/100
    //     </div>
    //   </div>
      
    //   <div className="space-y-6">
    //     {categories.map((category, index) => {
    //       const rating = getScoreRating(category.score, category.maxScore);
    //       const percentage = (category.score / category.maxScore) * 100;
          
    //       return (
    //         <div key={index} className={`relative p-4 rounded-xl bg-gradient-to-r ${category.bgColor} border border-white/10 hover:border-white/20 transition-all duration-300 group`}>
    //           {/* Header */}
    //           <div className="flex items-center justify-between mb-3">
    //             <div className="flex items-center space-x-3">
    //               <div className={`p-2 rounded-lg bg-white/10 ${category.iconColor} group-hover:scale-110 transition-transform duration-300`}>
    //                 {category.icon}
    //               </div>
    //               <div>
    //                 <h4 className="text-white font-semibold">{category.name}</h4>
    //                 <p className="text-gray-400 text-xs">{category.description}</p>
    //               </div>
    //             </div>
    //             <div className="text-right">
    //               <div className={`font-bold text-lg ${rating.color}`}>
    //                 {category.score}/{category.maxScore}
    //               </div>
    //             </div>
    //           </div>
        //        {/* Progress bar */}
        //    <div className="relative mb-2">
        //      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        //        <div 
        //          className={`h-full bg-gradient-to-r ${getProgressColor(category.score, category.maxScore)} transition-all duration-1000 ease-out rounded-full relative`}
        //          style={{ width: `${percentage}%` }}
        //        >
        //          {/* Animated shimmer effect */}
        //          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        //        </div>
        //      </div>
        //    </div>

    //           {/* Rating */}
    //           <div className="flex items-center justify-between">
    //             <span className={`text-xs font-bold ${rating.color} bg-black/20 px-2 py-1 rounded`}>
    //               {rating.text}
    //             </span>
    //             <span className="text-gray-400 text-xs">
    //               {percentage.toFixed(0)}% Complete
    //             </span>
    //           </div>
    //         </div>
    //       );
    //     })}
    //   </div>
    //           </Card>