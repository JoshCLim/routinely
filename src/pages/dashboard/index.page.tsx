import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
import moment from "moment";
import DashboardContextProvider, {
  useDashboardContext,
} from "./dashboard-context";
import { useRef, useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarCheck,
  Edit,
  Search,
  Trash,
  CalendarClock,
} from "lucide-react";
import ContentEditable from "react-contenteditable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Sidebar } from "~/components/sidebar";

export default function Dashboard() {
  const { data: calendarIds } = api.googleCalendar.getCalendarIds.useQuery();

  return (
    <DashboardContextProvider>
      <Head>
        <title>Dashboard | routinely</title>
      </Head>
      <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center 2xl:hidden">
        screen too small to display
      </div>
      <main className="hidden w-full select-none flex-row overflow-clip pl-16 2xl:flex">
        <Sidebar highlight="/dashboard" />
        <main className="flex w-full flex-grow flex-row">
          <section className="no-scrollbar flex h-screen min-w-[43%] flex-col gap-10 overflow-y-scroll border-r p-10">
            <DaySummary />
            <TaskSearch />
            <Separator />
            <div>
              <TasksWizard />
              <TasksList complete={false} />
            </div>
            <Separator />
            <TasksList complete={true} />
          </section>
          <section className="h-screen overflow-scroll p-10">
            {JSON.stringify(calendarIds, null, 4)}
          </section>
        </main>
      </main>
    </DashboardContextProvider>
  );
}

const TaskSearch = () => {
  const dashboardContext = useDashboardContext();
  const taskSearch = dashboardContext.getters.taskSearch;
  const setTaskSearch = dashboardContext.setters.setTaskSearch;

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        type="text"
        placeholder="Search for a task..."
        className="flex-grow rounded-xl rounded-r-sm border px-5 py-3 text-lg outline-none transition-colors focus:border-[#ddd] focus:bg-muted"
        value={taskSearch}
        onChange={(e) => setTaskSearch(e.target.value)}
      />
      <button className="aspect-square h-full rounded-xl rounded-l-sm border p-3 transition-colors hover:bg-muted">
        <Search />
      </button>
    </div>
  );
};

const Task = (task: RouterOutputs["tasks"]["getTasks"]["byDate"][number]) => {
  const ctx = api.useContext();
  const { mutate: markTaskComplete } = api.tasks.markTaskComplete.useMutation({
    onSuccess: () => void ctx.tasks.getTasks.invalidate(),
  });
  const { mutate: deleteTaskMutate } = api.tasks.deleteTask.useMutation({
    onSuccess: () => void ctx.tasks.getTasks.invalidate(),
  });
  const { mutate: editTaskMutate } = api.tasks.updateTask.useMutation({
    onSuccess: () => void ctx.tasks.getTasks.invalidate(),
  });

  const [editing, setEditing] = useState<boolean>(false);
  const title = useRef<string>(task.title);
  const [date, setDate] = useState<Date | null>(task.due);

  const deleteTask = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    deleteTaskMutate({ taskId: task.id });
  };
  const editTask = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
  };
  const handleEditBlur = (e: React.FocusEvent<HTMLElement>) => {
    e.preventDefault();
    setEditing(false);

    editTaskMutate({ title: title.current, taskId: task.id });
  };
  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setDate(date);
    editTaskMutate({ due: date, taskId: task.id });
  };

  return (
    <div
      className={`group/task flex cursor-pointer flex-row items-center justify-between gap-3 rounded-xl px-5 text-lg font-light transition-colors hover:bg-muted ${
        !!task.complete && "text-[#aaa]"
      }`}
    >
      <div className="flex flex-row items-center gap-3">
        <Checkbox
          className="h-6 w-6"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          checked={task.complete}
          onClick={() => {
            markTaskComplete({ taskId: task.id, complete: !task.complete });
          }}
        />
        <ContentEditable
          html={title.current}
          disabled={!editing}
          onBlur={handleEditBlur}
          onChange={(e) => (title.current = e.target.value)}
          className={`flex-grow py-3 outline-none ${editing && "text-[#777]"}`}
        />
      </div>
      <div className="invisible flex flex-row items-center gap-3 group-hover/task:visible">
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-[#777] transition-all hover:text-[#7795ff]">
              <CalendarCheck size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              initialFocus
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              selected={date}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
        <button
          className="text-[#777] transition-all hover:text-[#7a7]"
          onClick={editTask}
        >
          <Edit size={20} />
        </button>
        <button
          className="text-[#777] transition-all hover:text-[#f77]"
          onClick={deleteTask}
        >
          <Trash size={20} />
        </button>
      </div>
    </div>
  );
};

const TasksList = ({ complete }: { complete: boolean }) => {
  const dashboardContext = useDashboardContext();
  const taskSearch = dashboardContext.getters.taskSearch;
  const date = dashboardContext.getters.currDate;
  const { data: tasks, isLoading: isTasksLoading } =
    api.tasks.getTasks.byDate.useQuery({
      date,
    });

  if (isTasksLoading) return <></>;
  if (!tasks) return <>ERROR</>;

  return (
    <section className="flex flex-col gap-1">
      {tasks
        .filter((t) => t.complete == complete)
        .filter(
          (t) =>
            t.title.toLowerCase().indexOf(taskSearch.toLowerCase().trim()) != -1
        )
        .map((task) => (
          <Task key={task.id} {...task} />
        ))}
    </section>
  );
};

const TasksWizard = () => {
  const dashboardContext = useDashboardContext();
  const date = dashboardContext.getters.currDate;
  const { data: tasks, isLoading: isTasksLoading } =
    api.tasks.getTasks.byDate.useQuery({
      date,
    });
  const ctx = api.useContext();
  const [newTaskName, setNewTaskName] = useState<string>("");
  const { mutate: addTaskMutate, isLoading: isAddingTask } =
    api.tasks.addTask.useMutation({
      onSuccess: () => {
        setNewTaskName("");
        void ctx.tasks.getTasks.invalidate();
      },
    });

  if (isTasksLoading) return <></>;
  if (!tasks) return <>ERROR</>;

  return (
    <section className="flex flex-col gap-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTaskMutate({ title: newTaskName, date });
        }}
      >
        <input
          className="w-full rounded-xl border border-transparent px-5 py-3 text-lg font-light text-[#aaa] outline-none transition-colors hover:bg-[#fdfdfd] focus:border-[#ddd] focus:bg-muted"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          type="text"
          disabled={isAddingTask}
          placeholder={`+  add task for ${moment(date).calendar(null, {
            sameDay: "[today]",
            nextDay: "[tomorrow]",
            nextWeek: "dddd",
            lastDay: "[yesterday]",
            lastWeek: "[last] dddd",
            sameElse: "DD/MM/YYYY",
          })}`}
        />
      </form>
    </section>
  );
};

const DaySummary = () => {
  const dashboardContext = useDashboardContext();
  const currDate = moment(dashboardContext.getters.currDate);
  const setCurrDate = dashboardContext.setters.setCurrDate;

  return (
    <div className="flex flex-row gap-3">
      <div className="relative z-0 flex min-w-[300px] flex-grow flex-row items-center justify-between rounded-3xl rounded-r-2xl border-2 bg-muted p-10">
        <button
          onClick={() =>
            setCurrDate((p) => moment(p).subtract({ days: 1 }).toDate())
          }
          className="text-[#bbb] outline-none transition-colors hover:text-[#333]"
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex flex-col items-center justify-center">
          <p className="up text-5xl tracking-wide">{currDate.format("ddd")}</p>
          <p className="up text-8xl text-primary">{currDate.format("D")}</p>
          <p className="up text-5xl tracking-wide">{currDate.format("MMM")}</p>
        </div>
        <button
          onClick={() =>
            setCurrDate((p) => moment(p).add({ days: 1 }).toDate())
          }
          className="text-[#bbb] outline-none transition-colors hover:text-[#333]"
        >
          <ArrowRightIcon />
        </button>
        {currDate.format("YYYY/MM/DD") !== moment().format("YYYY/MM/DD") && (
          <button
            className="absolute bottom-2 left-[8.7rem] right-[8.7rem] z-0 flex items-center justify-center gap-3 rounded-xl bg-[#eee] py-2 transition-colors hover:bg-[#ddd]"
            onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              setCurrDate(today);
            }}
          >
            <CalendarClock />
            Today
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-4xl flex flex-row items-center justify-center gap-5 rounded-3xl rounded-b-2xl rounded-l-2xl rounded-bl-xl border-2 bg-muted p-10">
          <p className="text-8xl text-secondary">
            {dashboardContext.getters.taskCount}
          </p>
          <div>
            <p className="text-[2cqh] tracking-wide">
              tasks
              <br />
              to do
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-5 rounded-3xl rounded-l-2xl rounded-t-2xl rounded-tl-xl border-2 bg-muted p-10">
          <p className="text-8xl text-secondary">
            {dashboardContext.getters.projectCount}
          </p>
          <div>
            <p className="text-[2cqh] tracking-wide">
              ongoing
              <br />
              projects
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
