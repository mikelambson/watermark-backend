import express from "express";

const requestheaders = express.Router();

requestheaders.get('/', async (req, res) => {
  // Get the IP address from the X-Forwarded-For header
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;

  // Return the full request headers in JSON format
  res.json({
    forwarded: forwarded,
    ip: ip,
    headers: req.headers
  });
});

export default requestheaders;