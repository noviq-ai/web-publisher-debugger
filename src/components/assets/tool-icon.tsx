import * as React from "react";

const ToolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M9.333 16.631a2.368 2.368 0 1 0-4.737 0 2.368 2.368 0 0 0 4.737 0m0-9.667a2.368 2.368 0 1 0-4.737 0 2.368 2.368 0 0 0 4.737 0m9.667 0a2.368 2.368 0 1 0-4.737 0 2.368 2.368 0 0 0 4.737 0m-8.071 9.667a3.964 3.964 0 1 1-7.929 0 3.964 3.964 0 0 1 7.929 0m0-9.667a3.964 3.964 0 1 1-7.929 0 3.964 3.964 0 0 1 7.929 0m9.667 0a3.964 3.964 0 1 1-7.929 0 3.964 3.964 0 0 1 7.929 0"
    ></path>
    <path
      fill="currentColor"
      d="m14.728 9.928-4.8 4.8-1.06-1.06 4.8-4.8zM16.298 19.548v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0"
    ></path>
  </svg>
);

export default ToolIcon;
