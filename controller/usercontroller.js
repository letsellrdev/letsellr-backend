import user from "../model/user.js";

export const insertuser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const adduser = await user.create({
      name,
      email,
    });
    console.log(adduser);
    res.json({ user: adduser, message: "user added successfully" });
  } catch (error) {
    console.log(err);
    res.json({ message: "user cant add" });
  }
};
