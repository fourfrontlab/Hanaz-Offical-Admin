export default function StatusBadge({ status }: { status: string }) {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'Processing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'Dispatched':
    case 'In Transit':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'Delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'Returned':
    case 'Cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-neutral-100';
      textColor = 'text-neutral-800';
  }

  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}
