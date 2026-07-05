import { useAdminData } from '../../hooks/useAdminData'
import ScheduleTab from './'

export default function ScheduleTabRoute() {
	const { appointments } = useAdminData()
	return <ScheduleTab appointments={appointments} />
}
