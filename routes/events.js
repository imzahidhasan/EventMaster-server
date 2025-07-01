const express = require("express");
const Event = require("../models/Event");
const requireAuth = require("../middleware/authMiddleware");
const router = express.Router();

//POST /create-event
router.post("/create-event", requireAuth, async (req, res) => {
  //get the event details from the request body
  const { title, dateTime, location, description } = req.body;
  //create a new event
  const newEvent = await Event.create({
    title,
    name: req.user.name,
    creatorId: req.user.id,
    dateTime,
    location,
    description,
    attendeeCount: 0,
    joinedUsers: [],
  });

  res.status(201).json({
    message: "Event created successfully",
    event: newEvent,
  });
});

//GET /get-events
router.get("/get-events", requireAuth, async (req, res) => {
  const { title, filter, date } = req.query;
  const query = {};

  // 🔍 Search by title (case-insensitive)
  if (title) {
    query.title = new RegExp(title, "i");
  }

  // 📅 Filter by specific date if provided
  if (date) {
    const specificDate = new Date(date);
    if (!isNaN(specificDate.getTime())) {
      const startOfDay = new Date(specificDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(specificDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.dateTime = { $gte: startOfDay, $lte: endOfDay };
    }
  }
  // Only process filter if no specific date was provided or was invalid
  else if (filter) {
    // 🧠 Date range filtering on dateTime
    let start, end;

    switch (filter) {
      case "today": {
        const now = new Date();
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      }

      case "this-week": {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        start = new Date(weekStart.setHours(0, 0, 0, 0));
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }

      case "last-week": {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - dayOfWeek - 7);
        start = new Date(lastWeekStart.setHours(0, 0, 0, 0));
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }

      case "this-month": {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      }

      case "last-month": {
        const now = new Date();
        let lastMonthYear = now.getFullYear();
        let lastMonth = now.getMonth() - 1;

        // Handle January (month 0)
        if (lastMonth < 0) {
          lastMonth = 11; // December
          lastMonthYear--;
        }

        start = new Date(lastMonthYear, lastMonth, 1, 0, 0, 0, 0);
        // Get last day of the last month
        end = new Date(lastMonthYear, lastMonth + 1, 0, 23, 59, 59, 999);
        break;
      }
    }

    if (start && end) {
      query.dateTime = { $gte: start, $lte: end };
    }
  }

  const events = await Event.find(query).sort({ dateTime: -1 });
  res.json(events);
});

//GET /my-events
router.get("/my-events", requireAuth, async (req, res) => {
  const events = await Event.find({ creatorId: req.user.id }).sort({
    date: -1,
    time: -1,
  });
  res.json(events);
});

//PATCH /events/:id
router.patch("/events/:id", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) return res.status(404).json({ error: "Event not found" });

  // Check if the user is the creator of the event
  if (event.creatorId.toString() !== req.user.id)
    return res.status(403).json({ error: "Unauthorized" });

  Object.assign(event, req.body);
  await event.save();
  res.json({ message: "Event updated successfully", event });
});

//DELETE /events/:id
router.delete("/events/:id", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) return res.status(404).json({ error: "Event not found" });

  if (event.creatorId.toString() !== req.user.id)
    return res.status(403).json({ error: "Unauthorized" });

  await event.deleteOne();

  res.json({ message: "Event Deleted Successfully!" });
});

//PATCH /events/:id/join
router.patch("/events/:id/join", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event.joinedUsers.includes(req.user.id)) {
    return res.status(200).json({ message: "Already joined the event" });
  }

  event.attendeeCount += 1;
  event.joinedUsers.push(req.user.id);
  await event.save();

  res.json({ message: "Successfully joined the event!" });
});

module.exports = router;
