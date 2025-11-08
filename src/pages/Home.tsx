import { useEffect } from "react";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const lastLogin = localStorage.getItem("lastLogin");
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (token && lastLogin && Date.now() - Number(lastLogin) < oneWeek) {
      router.replace("/dashboard");
    } else {
      window.location.href = "/landing/index.html";
    }
  }, [router]);

  return null;
};

export default Home;