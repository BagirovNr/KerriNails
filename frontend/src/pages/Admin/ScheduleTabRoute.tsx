import { useAdminData } from '../../hooks/useAdminData'
import ScheduleTab from './ScheduleTab'

export default function ScheduleTabRoute() {
	const { appointments } = useAdminData()
	return <ScheduleTab appointments={appointments} />
}
