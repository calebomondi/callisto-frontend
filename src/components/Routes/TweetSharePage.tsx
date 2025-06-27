import { useEffect } from "react";
import axios from "axios";
import ConnectedNavbar from "../navbar/connectednavbar";
import Footer from "../home/footer";

const TweetSharePage = () => {
  useEffect(() => {
    const postTweet = async () => {
      const image = localStorage.getItem("fvp-wallet-tweet-image");
      if (!image) return;

      const text = `Just got my Wallet Score from fvp.finance 💸\n\nCome see what kind of crypto holder you are!`;
      const base64Image = image.split(",")[1];

      try {
        const res = await axios.post("http://fvp.finance/api/twitter/tweet", {
          text,
          image: base64Image,
        }, {
            withCredentials: true,
        });

      if (res.data?.tweet?.data?.id && res.data?.screen_name) {
        const tweetUrl = `https://twitter.com/${res.data.screen_name}/status/${res.data.tweet.data.id}`;
        window.location.href = tweetUrl;
      }
      } catch (err) {
        console.error("Failed to post tweet", err);
      }
    };

    postTweet();
  }, []);

  const image = localStorage.getItem("fvp-wallet-tweet-image");

  return (
    <div>
        <ConnectedNavbar />
        <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Sharing your score on X...</h1>
            <p className="text-purple-300 mb-4 loading"></p>
            {image && <img src={image} alt="wallet" style={{margin: "auto"}} />}
        </div>
        <Footer />
    </div>
  )
};

export default TweetSharePage;
