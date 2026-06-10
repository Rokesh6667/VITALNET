let io;

const init = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Clients/Users can join specific rooms (e.g. userId, hospitalId, 'admin', 'ambulances')
    socket.on('join', (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // Handle ambulance live location updates coming from drivers
    socket.on('updateLocation', (data) => {
      // data: { ambulanceId, latitude, longitude }
      io.to(`ambulance_${data.ambulanceId}`).emit('ambulanceLocationUpdated', data);
      io.to('admin').emit('ambulanceLocationUpdated', data);
      console.log(`Ambulance ${data.ambulanceId} location updated:`, data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => io;

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  init,
  getIO,
  emitToRoom,
  emitToAll,
};
