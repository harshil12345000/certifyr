/**
 * Gender-aware pronoun helper.
 * Returns the correct pronoun forms based on the provided gender value.
 * Falls back to "He/She" style when gender is not specified or is "other".
 */
export const pronouns = (gender?: string) => {
  const g = gender?.toLowerCase();
  if (g === "male") {
    return {
      heShe: "He",
      hisHer: "His",
      himHer: "him",
      sonDaughter: "son",
      SonDaughter: "Son",
      they: "He",
      their: "his",
      them: "him",
      theyHave: "He has",
    };
  }
  if (g === "female") {
    return {
      heShe: "She",
      hisHer: "Her",
      himHer: "her",
      sonDaughter: "daughter",
      SonDaughter: "Daughter",
      they: "She",
      their: "her",
      them: "her",
      theyHave: "She has",
    };
  }
  // Default / "other" – use inclusive slash form
  return {
    heShe: "He/She",
    hisHer: "His/Her",
    himHer: "him/her",
    sonDaughter: "son/daughter",
    SonDaughter: "Son/Daughter",
    they: "They",
    their: "their",
    them: "them",
    theyHave: "They have",
  };
};
