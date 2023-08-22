import Link from "next/link";
import {
  CalendarIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export const Sidebar = ({ highlight }: { highlight: string }) => {
  return (
    <nav className="fixed left-0 top-0 z-50 flex h-screen flex-col border">
      <SidebarLink
        label="dashboard"
        href={"/dashboard"}
        icon={<LayoutDashboardIcon />}
        highlight={highlight === "/dashboard"}
      />
      <SidebarLink
        label="tasks"
        href={"/tasks"}
        icon={<ListTodoIcon />}
        highlight={highlight === "/tasks"}
      />
      <SidebarLink
        label="calendar"
        href={"/calendar"}
        icon={<CalendarIcon />}
        highlight={highlight === "/calendar"}
      />
      <SidebarLink
        label="settings"
        href={"/settings"}
        icon={<Settings />}
        highlight={highlight === "/settings"}
      />
    </nav>
  );
};

const SidebarLink = ({
  href,
  icon,
  label,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  highlight: boolean;
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger>
          <Link
            className={`flex aspect-square items-center justify-center border-b p-5 transition-all hover:border-slate-300 hover:bg-slate-300 ${
              highlight && "bg-slate-200"
            }`}
            href={href}
          >
            {icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="z-50">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
