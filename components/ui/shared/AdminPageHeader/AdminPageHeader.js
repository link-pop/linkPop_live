"use client";

import SubHeading from "../SubHeading/SubHeading";
import GroupByUserSwitch from "@/app/admin/links/components/GroupByUserSwitch";

export default function AdminPageHeader({
  title,
  totalCount,
  totalClicks,
  showGroupByUser = false,
  byUser,
  onByUserChange,
}) {
  if (totalClicks !== undefined) {
    return (
      <div className="fc aic mb-4">
        <SubHeading>{title}</SubHeading>
        <div className="text-muted-foreground">
          Total clicks:{" "}
          <span className="font-semibold text-foreground">{totalClicks}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fc g5 aic">
      <SubHeading>
        {title} {totalCount !== undefined && `(${totalCount})`}
      </SubHeading>
      {showGroupByUser && (
        <GroupByUserSwitch checked={byUser} onCheckedChange={onByUserChange} />
      )}
    </div>
  );
}
