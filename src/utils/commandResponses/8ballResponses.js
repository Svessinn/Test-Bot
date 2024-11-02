const responses = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
  "Only if you put effort into it",
  "Not in this timeline",
  "It's obvious",
  "I do not think it matters",
  "Inevitably",
  "Not at all",
];

/**
 * @return {String}
 */

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
