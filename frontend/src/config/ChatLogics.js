export const getSender = (loggedUser, users) => {
  if (!users || users.length < 2) return "Unknown User"; // Handle edge cases
  return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
  if (!users || users.length < 2) return {}; 
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};
//for displaying profile pic for sender
export const isSameSender = (message, m, i, userId) => {
  return (
    i < message.length - 1 &&
    (message[i + 1].sender._id !== m.sender._id ||
      message[i + 1].sender._id === undefined) &&
    message[i].sender._id !== userId
  );
};

export const isLastMessage = (message, i, userId) => {
  return (
    i === message.length - 1 &&
    message[message.length - 1].sender._id !== userId &&
    message[message.length - 1].sender._id
  );
};
//to align message send by logged user to right

export const isSameSenderMargin = (message, m, i, userId) => {
  if (
    i < message.length - 1 &&
    message[i + 1].sender._id === m.sender._id &&
    message[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < message.length - 1 &&
      message[i + 1].sender._id !== m.sender._id &&
      message[i].sender._id !== userId) ||
    (i === message.length - 1 && message[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameUser = (message, m ,i) => {
  return i> 0 && message[i-1].sender._id === m.sender._id
};