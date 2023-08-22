import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useState,
  useContext,
} from "react";
import { api } from "~/utils/api";

type DashboardContext = {
  getters: {
    currDate: Date;
    taskCount: number;
    projectCount: number;
    taskSearch: string;
  };
  setters: {
    setCurrDate: Dispatch<SetStateAction<Date>>;
    setTaskSearch: Dispatch<SetStateAction<string>>;
  };
};

const DashboardContext = createContext<DashboardContext | null>(null);

export default function DashboardContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // initialise to today
  const currDay = new Date();
  currDay.setHours(0, 0, 0, 0);
  const [currDate, setCurrDate] = useState<Date>(currDay);
  const [taskSearch, setTaskSearch] = useState<string>("");
  const taskCount =
    api.tasks.getTasks.byDate.useQuery({ date: currDate }).data?.length ?? 0;
  const projectCount = 0;

  const getters = {
    currDate,
    taskCount,
    taskSearch,
    projectCount,
  };
  const setters = {
    setCurrDate,
    setTaskSearch,
  };

  const context = {
    getters,
    setters,
  };

  return (
    <DashboardContext.Provider value={context}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a ThemeContextProvider"
    );
  }

  return context;
};
