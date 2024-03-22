import Jimp from "jimp";

export const resizeAvatar = async (pathToAvatar) => {
  const image = await Jimp.read(pathToAvatar);
  return image.resize(250, 250).write(pathToAvatar);
};
