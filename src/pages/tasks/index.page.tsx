import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { Sidebar } from "~/components/sidebar";
import { type RouterOutputs, api } from "~/utils/api";
import TasksContextProvider, { useTasksContext } from "./tasks-context";
import { useRef, useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import ContentEditable from "react-contenteditable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  CalendarCheckIcon,
  EditIcon,
  FolderClosedIcon,
  TrashIcon,
} from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import moment from "moment";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { HexColorPicker } from "react-colorful";
import { Separator } from "~/components/ui/separator";

export default function Tasks() {
  return (
    <TasksContextProvider>
      <Head>
        <title>tasks | Routinely</title>
      </Head>
      <main className="">
        <Sidebar highlight="/tasks" />
        <ListsSidebar />
        <List />
      </main>
    </TasksContextProvider>
  );
}

const ListTask = (
  task: RouterOutputs["tasks"]["getTasks"]["byList"][number]
) => {
  const ctx = api.useContext();
  const tasksContext = useTasksContext();
  const { data: taskLists, isLoading: taskListsLoading } =
    api.taskLists.getTaskList.all.useQuery();
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

  if (taskListsLoading) return <></>;
  if (!taskLists) return <></>;

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
      className={`flex flex-row items-center gap-4 rounded-xl px-5 py-1 text-lg font-light transition-colors hover:bg-muted ${
        !!task.complete && "text-[#aaa]"
      }`}
    >
      <Checkbox
        className="h-6 w-6"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        checked={task.complete}
        onClick={() => {
          markTaskComplete({ taskId: task.id, complete: !task.complete });
        }}
      />
      <div className="flex flex-grow flex-col">
        <div className="flex w-full flex-row items-center justify-between gap-3">
          <div className="flex flex-grow flex-row items-center gap-3">
            <ContentEditable
              html={title.current}
              disabled={!editing}
              onBlur={handleEditBlur}
              onChange={(e) => (title.current = e.target.value)}
              className={`flex-grow select-none pb-1 pt-3 outline-none ${
                editing && "cursor-text text-[#6d906d]"
              }`}
            />
          </div>
          <div className="flex flex-row items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-[#777] transition-all hover:text-[#d6d61c]">
                  <FolderClosedIcon size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Move to list..." />
                  <CommandEmpty>
                    No lists found. Add some to get started!
                  </CommandEmpty>
                  <CommandGroup>
                    {[...taskLists, { id: null, title: "unassigned" }]
                      .filter(
                        (taskList) =>
                          taskList.id != tasksContext.getters.currListId
                      )
                      .map((taskList) => (
                        <CommandItem
                          key={taskList.id}
                          onSelect={() => {
                            editTaskMutate({
                              listId: taskList.id,
                              taskId: task.id,
                            });
                          }}
                        >
                          {taskList.title}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <button
              className="text-[#777] transition-all hover:text-[#7a7]"
              onClick={editTask}
            >
              <EditIcon size={20} />
            </button>
            <button
              className="text-[#777] transition-all hover:text-[#f77]"
              onClick={deleteTask}
            >
              <TrashIcon size={20} />
            </button>
          </div>
        </div>
        <div className="pb-3">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex flex-row items-center gap-2 text-[#777] transition-all hover:text-[#7795ff]">
                <CalendarCheckIcon size={20} />
                <span>
                  {task.due
                    ? moment(task.due).format("DD MMM YYYY")
                    : "No due date set"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto flex-col items-center p-0">
              <button
                className="mt-2 bg-[#fee] px-3 py-1"
                onClick={() => editTaskMutate({ taskId: task.id, due: null })}
              >
                Remove due date
              </button>
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
        </div>
      </div>
    </div>
  );
};

const List = () => {
  const tasksContext = useTasksContext();
  const { data: tasks, isLoading: tasksLoading } =
    api.tasks.getTasks.byList.useQuery({
      listId: tasksContext.getters.currListId,
    });
  const { data: taskList, isLoading: taskListLoading } =
    api.taskLists.getTaskList.byId.useQuery({
      listId: tasksContext.getters.currListId,
    });

  if (tasksLoading) return <></>;
  if (taskListLoading) return <></>;
  if (!tasks) return <></>;
  if (!taskList) return <></>;

  return (
    <div className="fixed left-[28rem] z-0 w-[calc(100%-28rem)] px-16 py-14">
      <header className="flex flex-row items-center gap-4">
        <ListCircle colour={taskList.colour} size={10} />
        <h2 className="text-3xl font-extralight tracking-wide">
          {taskList.title}
        </h2>
      </header>
      <div className="flex w-full flex-row gap-3">
        {tasks.filter((task) => !task.complete).length === 0 && (
          <p className="py-4 text-[#aaa]">Add some tasks to get started!</p>
        )}
        <div className="flex-grow py-4">
          {tasks
            .filter((task) => !task.complete)
            .map((task) => (
              <ListTask {...task} key={task.id} />
            ))}
        </div>
        <Separator orientation="vertical" />
        <div className="flex-grow py-4">
          <h3 className="px-5 text-xl font-extralight italic tracking-wide">
            Completed
          </h3>
          {tasks.filter((task) => task.complete).length === 0 && (
            <p className="px-5 py-4 text-[#aaa]">
              No tasks completed so far...
            </p>
          )}
          <div className="flex-grow py-1">
            {tasks
              .filter((task) => task.complete)
              .map((task) => (
                <ListTask {...task} key={task.id} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ListsSidebar = () => {
  const tasksContext = useTasksContext();
  const { data: lists, isLoading: listsLoading } =
    api.taskLists.getTaskList.all.useQuery();

  if (listsLoading) return <></>;
  if (!lists) return <></>;

  return (
    <div className="fixed left-16 top-0 z-40 flex h-screen w-96 flex-col border-r bg-white">
      {lists.map((list) => (
        <ListsSidebarLink {...list} key={list.id} />
      ))}
      {lists.length === 0 && (
        <p className="absolute bottom-[50%] w-full text-center text-[#aaa]">
          Create a task list to begin!
        </p>
      )}
      <div className="absolute bottom-0 w-full">
        <button
          className={`flex w-full flex-row items-center gap-3 border-b px-5 py-4 text-left transition-colors hover:bg-muted ${
            !tasksContext.getters.currListId && "bg-[#fafafa]"
          }`}
          onClick={() => {
            tasksContext.setters.setCurrListId(null);
          }}
        >
          <ListCircle colour="#aaa" />
          unassigned tasks
        </button>
        <ListsSidebarAddButton />
      </div>
    </div>
  );
};

const ListsSidebarAddButton = () => {
  const ctx = api.useContext();
  const [colour, setColour] = useState<string>("#000");
  const [title, setTitle] = useState<string>("");
  const { mutate: createTaskList } = api.taskLists.createTaskList.useMutation({
    onSuccess: () => void ctx.taskLists.getTaskList.invalidate(),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full border-b px-5 py-4 transition-colors hover:bg-muted">
          + add list
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <form
          className="flex flex-col items-center overflow-hidden rounded-xl py-2"
          onSubmit={(e) => {
            e.preventDefault();
            createTaskList({ colour, title });
          }}
        >
          <HexColorPicker color={colour} onChange={setColour} />
          <input
            type="text"
            placeholder="new list name..."
            className="w-full px-5 py-3 text-center outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="submit"
            value="create"
            className="rounded-xl bg-[#eee] px-3 py-1"
          />
        </form>
      </PopoverContent>
    </Popover>
  );
};

const ListsSidebarLink = (
  list: RouterOutputs["taskLists"]["getTaskList"]["all"][number]
) => {
  const tasksContext = useTasksContext();

  return (
    <button
      className={`flex w-full flex-row items-center gap-3 border-b px-5 py-4 text-left transition-colors hover:bg-muted ${
        tasksContext.getters.currListId === list.id && "bg-[#fafafa]"
      }`}
      onClick={() => {
        tasksContext.setters.setCurrListId(list.id);
      }}
    >
      <ListCircle colour={list.colour} />
      {list.title}
    </button>
  );
};

const ListCircle = ({
  colour,
  size = 7,
}: {
  colour: string;
  size?: number;
}) => {
  return (
    <div
      className={`h-${size} w-${size} rounded-full`}
      style={{ backgroundColor: colour }}
    ></div>
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
