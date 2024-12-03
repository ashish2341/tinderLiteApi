const constants = require("../../helper/constants");
const Community = require("../../models/communityModel");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dxjyglb16",
  api_key: "731694561994395",
  api_secret: "JevKs_V4azMgBJC0la5bIWJHcZU",
});

exports.createCommunity = async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;

    const file = req.files.image;

    const ImageUrl = await cloudinary.uploader.upload(file.tempFilePath);

    const newCommunity = new Community({
      name,
      description,
      imageUrl: ImageUrl.secure_url,
      createdBy,
    });

    const savedCommunity = await newCommunity.save();

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: savedCommunity,
      success: true,
      message: "Community created successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.getAllCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const communities = await Community.find()
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'full_name email profile_image');

    const totalCommunities = await Community.countDocuments();

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      data: communities,
      success: true,
      total: totalCommunities,
      currentPage: page,
      totalPages: Math.ceil(totalCommunities / limit),
      message: "Communities fetched successfully.",
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};

exports.updateCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const { name, description, imageUrl, likes, commentText, userId } = req.body;

    const updateFields = {
      ...(name && { name }),
      ...(description && { description }),
      ...(imageUrl && { imageUrl }),
      updatedAt: Date.now(),
    };

    if (likes) {
      updateFields.$addToSet = { likes: likes };
    }

    if (commentText && userId) {
      updateFields.$push = {
        comments: {
          userId,
          commentText,
          createdAt: Date.now(),
        },
      };
    }

    const updatedCommunity = await Community.findByIdAndUpdate(communityId, updateFields, { new: true });

    if (!updatedCommunity) {
      return res.status(constants.status_code.header.server_error).send({
        statusCode: 404,
        success: false,
        message: 'Community not found.',
      });
    }

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: 'Community updated successfully.',
      data: updatedCommunity,
    });
  } catch (error) {
    return res
      .status(constants.status_code.header.server_error)
      .send({ statusCode: 500, error: error.message, success: false });
  }
};