/**
 * TODO: tooltips
 */

var Calendr = React.createClass({
	render: function(){
		year = data['year'];
		month = data['month'];
		weeks = data['weeks'];
		rulesCalendar = data['rulesCalendar'];
		console.log(rulesCalendar);
		for (var w in weeks) {
			week = weeks[w];
			for (var d in week) {
				day = week[d];
				if (day == 0) {
					//make a non-day
					console.log('nonday');
				} else {
					//make a day with rulesCalendar['some date']
					date = new Date(year, month-1, day);
					date = date.toISOString();
					console.log(rulesCalendar[date]);
				}
			}
		}
		// var WeeksWithData = rulesCalendar.map(function(week) {
		// 	var DaysInWeek = week.map(function(day) {
		// 		return (
		// 			<WeekDayWithRules data={day}/>
		// 			);
		// 	});
		// 	return (
		// 		<tr class="week">
		// 			<DaysInWeek />
		// 		</tr>
		// 		);
		// });
		return (
			<table>
				<thead>
				</thead>
				<tbody>
				</tbody>
			</table>
			)
	}
});
React.render(
  <Calendr />,
  document.getElementById('content')
);
