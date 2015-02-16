/**
 * TODO: tooltips
 */

var Calendr = React.createClass({
	render: function(){
		year = data['year'];
		month = data['month'];
		weeks = data['weeks'];
		rulesCalendar = data['rulesCalendar'];

		// will need Full textual names of month, ECMA's recent update isn't fully supported yet.
		var monthNames = [ "January", "February", "March", "April", "May", "June",
		    "July", "August", "September", "October", "November", "December" ];

		builtWeeks = [];

		for (var w in weeks) {
			builtWeek = [];
			week = weeks[w];
			for (var d in week) {
				day = week[d];
				if (day == 0) {
					//MAKE A NON-DAY
					builtWeek.push(<CalendrNonDay />);
				} else {
					//MAKE A DAY WITH RULESCALENDAR['YYY-MM-DD']
					//a complicated looking but honestly much simpler way of getting just the date in ISO format
					date = new Date(year, month-1, day).toISOString().split('T')[0];
					builtWeek.push(<CalendrDay data={rulesCalendar[date]} date={day}/>);
				}
			}
			builtWeeks.push(<CalendrWeek data={builtWeek} />);
		}

		// date math to get links to last and next months
		var dateUrl = 'http://www.triskeliondevelopment.com/calendar/';
		var lastMonth = new Date(year, month-2, 1);
		console.log(lastMonth.toISOString());
		console.log(lastMonth.getMonth());
		lastMonth = dateUrl+lastMonth.getFullYear()+'/'+(lastMonth.getMonth()+1);
		var nextMonth = new Date(year, month, 1);
		console.log(nextMonth.toISOString());
		console.log(nextMonth.getMonth());
		nextMonth = dateUrl+nextMonth.getFullYear()+'/'+(nextMonth.getMonth()+1);

		return (
			<table>
				<thead>
					<th className="monthname">
						<a href={lastMonth}>&laquo;</a>
					</th>
					<th className="monthname" colSpan="5">{monthNames[month-1]}</th>
					<th className="monthname">
						<a href={nextMonth}>&raquo;</a>
					</th>
				</thead>
				<tbody>
					<tr className="weekdaynames">
					    <td>
					        Sunday
					    </td>
					    <td>
					        Monday
					    </td>
					    <td>
					        Tuesday
					    </td>
					    <td>
					        Wednesday
					    </td>
					    <td>
					        Thursday
					    </td>
					    <td>
					        Friday
					    </td>
					    <td>
					        Saturday
					    </td>
					</tr>
					{builtWeeks}
				</tbody>
			</table>
			)
	}
});

CalendrWeek = React.createClass({
	render: function(){
		return (
			<tr className="week">
				{this.props.data}
			</tr>
			)
	}
});

CalendrNonDay = React.createClass({
	render: function(){
		return (
			<td className="notaday"></td>
			);
	}
});
CalendrDay = React.createClass({
	render: function(){
		return (
			<td className="day">
				<span className="date">{this.props.date}</span>
				<CalendrRulesList data={this.props.data['rules'] ? this.props.data['rules'] : []} />
				<span className="total">{this.props.data['total']}</span>
			</td>
			)
	}
});

CalendrRulesList = React.createClass({
	render: function(){
		var ruleItems = this.props.data.map(function(item){
			var ruleClass = (Math.abs(item['amount']) == item['amount'] ? 'credit' : 'debit');
			item['amount'] = (Math.abs(item['amount']) == item['amount'] ? '+'+item['amount'] : item['amount']);
			return (
				<li key={item['name']} className={ruleClass}>
					{item['amount']} {item['name']}
				</li>
				);
		});
		return (
			<ul className="rules">
				{ruleItems}
			</ul>
			);
	}
});

React.render(
  <Calendr />,
  document.getElementById('content')
);
