import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { Download } from "lucide-react";

export default function DownloadButtonWithGST() {
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("");

  const handleDownload = () => {
    console.log(`Downloading GST report for ${month} ${year}`);
    // Your download logic here
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button className="w-full sm:w-auto px-6 py-7 sm:py-2 rounded-md bg-[#3c29b7] hover:bg-blue-700 flex items-center justify-center">
          <Download className="h-4 w-4 mr-2 text-white" />
          <span className="text-white">Download</span>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        sideOffset={8}
        className="min-w-[220px] bg-white border border-gray-200 rounded-md shadow-lg p-2"
      >
        {/* GST Report with Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <DropdownMenu.Item
              className="px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
            >
              GST Report
            </DropdownMenu.Item>
          </Popover.Trigger>

          <Popover.Content
            sideOffset={8}
            className="rounded-lg border bg-white p-4 shadow-lg w-64"
          >
            <h3 className="font-semibold mb-3">Download GST Reports</h3>

            {/* Year Select */}
            <label className="block text-sm mb-1">Year</label>
            <select
              className="border rounded px-2 py-1 w-full mb-3"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>

            {/* Month Select */}
            <label className="block text-sm mb-1">Select Month</label>
            <select
              className="border rounded px-2 py-1 w-full mb-4"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Select</option>
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#3c29b7] hover:bg-blue-700 text-white"
                onClick={handleDownload}
              >
                Download
              </Button>
            </div>
          </Popover.Content>
        </Popover.Root>

        {/* Other Menu Items */}
        <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
          Tax Invoice
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
          Supplier Tax Invoice
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
          Payments to Date
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
          Outstanding Payments
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
          Payments at Order Level
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
