export default function UserPlanLabel({ mongoUser }) {
  return (
    <div className="a -r2 -t15 t_075">
      {mongoUser?.isAdmin ? <div>admin</div> : <div>{mongoUser?.plan}</div>}
    </div>
  );
}
