const User = require("../../schema/user");
const { splitRegNumber } = require("../../services/utils");

module.exports = {
  getUserData: async (req, res) => {
    try {
      const orQuery = [];
      if (req.query.userId) {
        orQuery.push({ _id: req.query.userId });
      }
      if (req.query.email) {
        orQuery.push({ email: req.query.email });
      }
      if (orQuery.length) {
        let userData = await User.findOne({
          $or: orQuery,
        });
        if (!userData) return res.status(404).send("User not found");
        userData = userData.toJSON();
        delete userData.password;
        return res.success({ user: userData });
      }
      return res.success({ user: req.session.user });
    } catch (error) {
      console.error("Error getting user:", error.message);
      return res.status(500).send(error);
    }
  },
  getUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 5,
        sortBy = "createdAt",
        order = "desc",
        search = "",
        selectedBatches = [],
      } = req.body;

      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const sortOrder = order === "asc" ? 1 : -1;
      let searchQuery = search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } }, // Case-insensitive search in "name"
              { batch: { $regex: search, $options: "i" } },
              { email: { $regex: `^${search}$`, $options: "i" } },
              { mobileNumber: search },
              { regNumber: search },
              { department: { $regex: `^${search}$`, $options: "i" } },
            ],
          }
        : {};
      if (selectedBatches.length)
        searchQuery = { $and: [searchQuery, { $or: selectedBatches }] };

      const pipeline = [
        // 1️⃣ Search Filter (Case-insensitive)
        {
          $match: searchQuery,
        },

        // 2️⃣ Sort
        {
          $sort: { [sortBy]: sortOrder },
        },

        // 3️⃣ Pagination
        {
          $skip: pageNumber * pageSize,
        },
        {
          $limit: pageSize,
        },

        // 4️⃣ Select Required Fields
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            regNumber: 1,
            mobileNumber: 1,
            certificateImage: 1,
            status: 1,
            userImage: 1,
            batch: 1,
            department: 1,
            isAdmin: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      // Run Aggregation
      const users = await User.aggregate(pipeline);

      const totalCountResult = await User.countDocuments(searchQuery);
      const countResult = await User.aggregate([
        {
          $project: {
            batch: "$batch",
            department: 1,
          },
        },
        {
          $group: {
            _id: { batch: "$batch", department: "$department" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.batch": 1, "_id.department": 1 },
        },
      ]);

      const structuredData = countResult.reduce(
        (acc, { _id: { batch, department }, count }) => {
          if (!acc[batch]) acc[batch] = {};
          acc[batch][department] = count;
          return acc;
        },
        {}
      );

      const transformedData = Object.entries(structuredData).map(
        ([batch, counts]) => ({
          batch,
          total: Object.entries(counts).reduce(
            (sum, [, value]) => sum + value,
            0
          ),
          counts: Object.entries(counts).map(([department, count]) => ({
            department,
            count,
          })),
        })
      );
      return res.success({
        users,
        totalCount: totalCountResult,
        countData: transformedData,
      });
    } catch (error) {
      console.error("Error getting users", error.message);
      return res.status(500).send(error);
    }
  },
  updateProfile: async (req, res) => {
    try {
      if (!req.body._id) {
        return res.status(422).send("Unable to update");
      }

      const updateRecord = {
        email: req.body.email,
        name: req.body.name,
        mobileNumber: req.body.mobileNumber,
        certificateImage: req.body.certificateImage,
        userImage: req.body.userImage,
        status: req.body.status,
        regNumber: req.body.regNumber,
        batch: splitRegNumber(req.body.regNumber, "batch"),
        department: splitRegNumber(req.body.regNumber, "dept"),
      };

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.body._id },
        updateRecord,
        { new: true }
      );
      const finalUser = updatedUser.toJSON();
      delete finalUser.password;

      return res.success(finalUser);
    } catch (error) {
      console.error("Error updating profile..", error);
      return res.status(500).send(error);
    }
  },
  changeStatus: async (req, res) => {
    try {
      if (!req.body._id) {
        return res.status(422).send("Unable to update");
      }

      const updateRecord = {
        status: req.body.status,
      };

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.body._id },
        updateRecord,
        { new: true }
      );
      const finalUser = updatedUser.toJSON();
      delete finalUser.password;

      return res.success({ user: finalUser });
    } catch (error) {
      console.error("Error changeStatus..", error);
      return res.status(500).send(error);
    }
  },
  makeAdmin: async (req, res) => {
    try {
      if (!req.body._id) {
        return res.status(422).send("Unable to update");
      }

      const updateRecord = {
        isAdmin: req.body.isAdmin,
      };

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.body._id },
        updateRecord,
        { new: true }
      );
      const finalUser = updatedUser.toJSON();
      delete finalUser.password;

      return res.success({ user: finalUser });
    } catch (error) {
      console.error("Error makeAdmin..", error);
      return res.status(500).send(error);
    }
  },
  deleteUser: async (req, res) => {
    try {
      if (!req.query.userId) {
        return res.status(422).send("Unable to delete");
      }

      const deleteResp = await User.deleteOne(
        { _id: req.query.userId },
        { new: true }
      );

      return res.success(deleteResp);
    } catch (error) {
      console.error("Error deleteUser..", error);
      return res.status(500).send(error);
    }
  },
};
