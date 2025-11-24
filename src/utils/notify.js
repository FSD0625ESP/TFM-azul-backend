let _sender = null;

export function setSender(fn) {
  _sender = fn;
}

export async function notifyUser(userId, payload) {
  if (!_sender) return false;
  try {
    await _sender(userId, payload);
    return true;
  } catch (e) {
    console.error('notifyUser error', e);
    return false;
  }
}

export default { setSender, notifyUser };
