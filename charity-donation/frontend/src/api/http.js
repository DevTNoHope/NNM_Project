const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

export const mockGet = async (data, ms = 400) => {
  await delay(ms);
  return { data, success: true };
};

export const mockPost = async (payload, ms = 600) => {
  await delay(ms);
  return { data: payload, success: true, message: 'Success' };
};