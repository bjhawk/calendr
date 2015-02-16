/**
 * JSX REACT file - Calendar view
 * Builds table view of calendar with given data (from json, built by API)
 * 
 * TODO: Tooltips instead of putting value at bottom of list?
 */

var Calendr = React.createClass({
    render: function(){
        //data is a json object put into page by API
        year = data['year'];
        month = data['month'];
        weeks = data['weeks'];
        rulesCalendar = data['rulesCalendar'];

        // will need Full textual names of month, ECMA's recent update for month names isn't fully supported yet.
        var monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];

        /**
         * Iterate through days in each week, building REACT classes to display given data,
         * this preserves the shape of the given weeks var.
         **/
        builtWeeks = [];
        // are there better keys to use?
        var weekIterator = 0;
        var dayIterator = 0;
        for (var w in weeks) {
            builtWeek = [];
            week = weeks[w];
            for (var d in week) {
                day = week[d];
                if (day == 0) {
                    //make a "non-day"
                    builtWeek.push(<CalendrNonDay  key={dayIterator}/>);
                } else {
                    //make a day with rulescalendar['yyy-mm-dd']
                    //a complicated looking but honestly much simpler way of getting just the date in ISO format
                    date = new Date(year, month-1, day).toISOString().split('T')[0];
                    builtWeek.push(<CalendrDay data={rulesCalendar[date]} date={day} key={dayIterator}/>);
                }
                dayIterator++;
            }
            builtWeeks.push(<CalendrWeek data={builtWeek} key={weekIterator}/>);
            weekIterator++;
        }

        // date math to get links to last and next months
        var dateUrl = 'http://www.triskeliondevelopment.com/calendar/';

        var lastMonth = new Date(year, month-2, 1);
        lastMonth = dateUrl+lastMonth.getFullYear()+'/'+(lastMonth.getMonth()+1);

        var nextMonth = new Date(year, month, 1);
        nextMonth = dateUrl+nextMonth.getFullYear()+'/'+(nextMonth.getMonth()+1);

        /**
         * Returns built table. Pieces are built above and inserted appropriately into table.
         * Table header and weekday name row are built statically - no need for a class for those
         */
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

// a "week" - a row in our table
CalendrWeek = React.createClass({
    render: function(){
        return (
            <tr className="week">
                {this.props.data}
            </tr>
            )
    }
});

// a "non-day" - a day in a week that doesn't belong to the current (given) month
// will display as just empty and grey
CalendrNonDay = React.createClass({
    render: function(){
        return (
            <td className="notaday"></td>
            );
    }
});
// a "day" - a day belonging to this month. Rules list is built by parent class and 
// total and rules list are put into appropriate places here.
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

// Rules List - a <ul> with the given rules for the current day, classed to differentiate credits and debits
// displays amount and name
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

// Render page
React.render(
  <Calendr />,
  document.getElementById('content')
);
