const slugify = require("../utils/slugify");
const StoryModel = require("../models/story.model");
const ChapterModel = require("../models/chapter.model");
const notificationService = require("../services/notification.services");
const { NOTIF_TYPE, NOTIF_TEMPLATE } = require("../services/notification.services");
const { sanitizeFields } = require("../utils/sanitize");

const uploadStory = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    // Normalize theloai_ids to ensure it's an array
    if (!data.theloai_ids && data['theloai_ids[]']) {
         data.theloai_ids = data['theloai_ids[]'];
    }
    // If it's a single value (string), convert to array
    if (data.theloai_ids && !Array.isArray(data.theloai_ids)) {
        data.theloai_ids = [data.theloai_ids];
    }
    
    // Convert string IDs to numbers if needed (frontend sends strings in FormData)
    if (data.theloai_ids && Array.isArray(data.theloai_ids)) {
        data.theloai_ids = data.theloai_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    }

    if (!file) {
      return res.status(400).json({ message: "Ảnh bìa là bắt buộc" });
    }

    if (
      !data.ten_truyen ||
      data.ten_truyen.trim() === "" ||
      !data.tac_gia ||
      data.tac_gia.trim() === "" ||
      !data.mo_ta ||
      data.mo_ta.trim() === "" ||
      !data.chuong_mau ||
      data.chuong_mau.trim() === "" ||
      data.chuong_mau.trim() === "<p></p>" ||
      !data.theloai_ids ||
      !Array.isArray(data.theloai_ids) ||
      data.theloai_ids.length === 0
    ) {
      let missingField = "";
      if (!data.ten_truyen || data.ten_truyen.trim() === "")
        missingField = "Tên truyện";
      else if (!data.tac_gia || data.tac_gia.trim() === "")
        missingField = "Tác giả";
      else if (!data.mo_ta || data.mo_ta.trim() === "") missingField = "Mô tả";
      else if (
        !data.chuong_mau ||
        data.chuong_mau.trim() === "" ||
        data.chuong_mau.trim() === "<p></p>"
      )
        missingField = "Nội dung chương mẫu";
      else if (
        !data.theloai_ids ||
        !Array.isArray(data.theloai_ids) ||
        data.theloai_ids.length === 0
      )
        missingField = "Thể loại";

      return res
        .status(400)
        .json({ message: `Vui lòng điền đầy đủ thông tin: ${missingField}` });
    }

    // Sanitize user input fields against XSS
    sanitizeFields(data, ['ten_truyen', 'tac_gia', 'mo_ta', 'chuong_mau']);

    const anh_bia = file.path;
    const now = new Date();
    const user_id = req.user.id;
    const userRole = req.user.role;

    const slug = slugify(data.ten_truyen, { lower: true, strict: true });

    let trang_thai_kiem_duyet = "cho_duyet";
    if (userRole === "admin") {
      trang_thai_kiem_duyet = "duyet";
    }

    const storyId = await StoryModel.create({
      ten_truyen: data.ten_truyen,
      slug,
      tac_gia: data.tac_gia,
      mo_ta: data.mo_ta,
      trang_thai: data.trang_thai || "dang_ra",
      link_nguon: data.link_nguon || null,
      doi_tuong_doc_gia: data.doi_tuong_doc_gia || null,
      thoi_gian_tao: now,
      thoi_gian_cap_nhat: now,
      anh_bia,
      trang_thai_kiem_duyet,
      user_id,
      ghi_chu_admin: null,
    });

    if (Array.isArray(data.theloai_ids) && data.theloai_ids.length > 0) {
      await StoryModel.addGenresForStory(storyId, data.theloai_ids);
    }

    await ChapterModel.createSampleChapter({
      truyen_id: storyId,
      noi_dung: data.chuong_mau,
      thoi_gian_dang: now,
    });

    if (trang_thai_kiem_duyet === "cho_duyet") {
      try {
        const adminContent = NOTIF_TEMPLATE.STORY_PENDING_REVIEW(data.ten_truyen, data.tac_gia);
        await notificationService.sendNotificationToAdmins(
          adminContent,
          NOTIF_TYPE.APPROVAL,
          storyId
        );
      } catch (notifyErr) {
        console.warn("Failed to send admin notification:", notifyErr);
      }
    }

    res.status(201).json({
      message: `Tạo truyện thành công! Truyện đang '${trang_thai_kiem_duyet}'.`,
      storyId,
      trang_thai_kiem_duyet: trang_thai_kiem_duyet,
    });
  } catch (err) {
    console.error("Lỗi khi upload truyện:", err);
    res.status(500).json({
      message: "Lỗi khi upload truyện",
      error: err.message,
    });
  }
};

module.exports = { uploadStory };
