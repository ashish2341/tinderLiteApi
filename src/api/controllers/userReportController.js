const UserReport = require("../../models/userReportModel");
const constants = require("../../helper/constants");

exports.createReport = async (req, res) => {
  try {
    const { reportedOn, whoReported, reportDescription } = req.body;

    if (!reportedOn || !whoReported || !reportDescription) {
      return res.status(constants.status_code.header.bad_request).send({
        statusCode: 400,
        success: false,
        error: "All fields are required.",
      });
    }

    const newReport = new UserReport({
      reportedOn,
      whoReported,
      reportDescription,
      status: "Pending",
      reportDate: new Date(),
    });

    await newReport.save();

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: "Report created successfully.",
      data: newReport,
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const reports = await UserReport.find()
      .populate("reportedOn", "full_name user_name email")
      .populate("whoReported", "full_name user_name email")
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const totalReports = await UserReport.countDocuments();

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: "Reports fetched successfully.",
      data: reports,
      totalReports,
      currentPage: page,
      totalPages: Math.ceil(totalReports / limit),
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await UserReport.findById(reportId)
      .populate("reportedOn", "full_name user_name email")
      .populate("whoReported", "full_name user_name email");

    if (!report) {
      return res.status(constants.status_code.header.not_found).send({
        statusCode: 404,
        success: false,
        error: "Report not found.",
      });
    }

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: "Report fetched successfully.",
      data: report,
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(constants.status_code.header.bad_request).send({
        statusCode: 400,
        success: false,
        error: "Status is required.",
      });
    }

    const updatedReport = await UserReport.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(constants.status_code.header.not_found).send({
        statusCode: 404,
        success: false,
        error: "Report not found.",
      });
    }

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: "Report status updated successfully.",
      data: updatedReport,
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const deletedReport = await UserReport.findByIdAndDelete(reportId);

    if (!deletedReport) {
      return res.status(constants.status_code.header.not_found).send({
        statusCode: 404,
        success: false,
        error: "Report not found.",
      });
    }

    return res.status(constants.status_code.header.ok).send({
      statusCode: 200,
      success: true,
      message: "Report deleted successfully.",
    });
  } catch (error) {
    return res.status(constants.status_code.header.server_error).send({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};
