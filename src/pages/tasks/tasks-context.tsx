import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useState,
  useContext,
} from "react";

type TasksContext = {
  getters: {
    currListId: string | null;
  };
  setters: {
    setCurrListId: Dispatch<SetStateAction<string | null>>;
  };
};

const TasksContext = createContext<TasksContext | null>(null);

export default function TasksContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currListId, setCurrListId] = useState<string | null>(null);

  const getters = {
    currListId,
  };
  const setters = {
    setCurrListId,
  };

  const context = {
    getters,
    setters,
  };

  return (
    <TasksContext.Provider value={context}>{children}</TasksContext.Provider>
  );
}

export const useTasksContext = () => {
  const context = useContext(TasksContext);

  if (!context) {
    throw new Error(
      "useTasksContext must be used within a ThemeContextProvider"
    );
  }

  return context;
};
