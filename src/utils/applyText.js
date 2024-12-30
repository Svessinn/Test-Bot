module.exports = (canvas, text, fontSize) => {
  const context = canvas.getContext("2d");

  do {
    context.font = `${(fontSize -= 10)}px sans-serif`;
  } while (context.measureText(text).width > canvas.width - 400);

  return context.font;
};