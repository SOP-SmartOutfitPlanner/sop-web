import { User } from "@/lib/types/auth";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
  },
  {
    id: "3",
    email: "alex.johnson@example.com",
    name: "Alex Johnson",
  },
];

export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find((user) => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const createUser = (userData: Omit<User, "id">): User => {
  const newUser: User = {
    ...userData,
    id: (mockUsers.length + 1).toString(),
  };
  mockUsers.push(newUser);
  return newUser;
};
