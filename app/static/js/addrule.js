/**
 * TODO: Datepicker
 */

var RuleBox = React.createClass({
  loadRulesFromServer: function() {
    $.ajax({
      url: this.props.ruleUrl,
      dataType: 'text',
      success: function(data) {
        data = $.parseJSON(data);
        this.setState({data: data['rules']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.ruleUrl, status, err.toString());
      }.bind(this)
    });
  },
  handleRuleSubmit: function(rule) {
    var submitUrl = this.props.apiUrl+'add_rule';
    $.ajax({
      url: submitUrl,
      type: 'POST',
      data: rule,
      success: function(data) {
        this.loadRulesFromServer();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(submitUrl, status, err.toString());
      }.bind(this)
    });
  },
  handleRuleDelete: function(ruleId) {
    var deleteUrl = this.props.apiUrl+'delete_rule';
    $.ajax({
      url: deleteUrl,
      type: 'POST',
      data: {ruleId: ruleId},
      success: function(data) {
        this.loadRulesFromServer();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(deleteUrl, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadRulesFromServer();
    setInterval(this.loadRulesFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="ruleBox">
        <h2>Rules</h2>
        <RuleTable data={this.state.data} onRuleDelete={this.handleRuleDelete} />
        <h3> Add a rule </h3>
        <RuleForm onRuleSubmit={this.handleRuleSubmit}/>
      </div>
    );
  }
});

var RuleTable = React.createClass({
  handleDelete: function(ruleId) {
    this.props.onRuleDelete(ruleId);
  },
  render: function() {
      var deleteStyle = {cursor: 'pointer'};
      var self = this
      var rules = this.props.data.map(function(rule) {
      return (
        <tr key={rule.id}>
            <td>
              <span style={deleteStyle} onClick={self.handleDelete.bind(self, rule.id)}>(delete)</span>
              {rule.name}
            </td>
            <td className="{rule.type}">{rule.type == 'credit' ? '+' : '-'}{rule.amount.toFixed(2)}</td>
            <td>{rule.category}</td>
            <td>{rule.start}</td>
            <td>{rule.interval > 0 ? rule.interval+' '+rule.unit : 'none'}</td>
            <td>{rule.note}</td>
        </tr>
        );
    });
    return (
      <table className="ruleTable">
          <thead>
            <RuleHeader />
          </thead>
          <tbody>
            {rules}
          </tbody>
      </table>
    );
  }
});

var RuleHeader = React.createClass({
  render: function() {
    return (
      <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Start</th>
          <th>Repeat</th>
          <th>Note</th>
      </tr>
    );
  }
});

var RuleForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    // TODO: validate amount is a number (strip all other chars), one decimal
    var name = this.refs.name.getDOMNode().value.trim();
    var user = this.refs.user.getDOMNode().value.trim();
    var amount = this.refs.amount.getDOMNode().value.trim();
    var category = this.refs.category.getDOMNode().value.trim();
    var start = this.refs.start.getDOMNode().value.trim();
    var repeat = this.refs.repeat.getDOMNode().checked;
    var interval = this.refs.interval.getDOMNode().value.trim();
    var unit = this.refs.unit.getDOMNode().value.trim();
    var note = this.refs.note.getDOMNode().value.trim();
    
    ruleObject = {name: name, user: user, amount: amount, category: category, start: start, note: note};
    if (repeat) {
      ruleObject.interval = interval;
      ruleObject.unit = unit;
    } else {
      ruleObject.interval = null;
      ruleObject.unit = null;
    }

    this.props.onRuleSubmit(ruleObject);
    
    this.refs.name.getDOMNode().value = null;
    // this.refs.user.getDOMNode().value = null;
    this.refs.amount.getDOMNode().value = null;
    this.refs.category.getDOMNode().value = 1;
    this.refs.start.getDOMNode().value = null;
    this.refs.repeat.getDOMNode().checked = false;
    this.refs.interval.getDOMNode().value = 1;
    this.refs.unit.getDOMNode().value = 'days';
    this.refs.note.getDOMNode().value = null;
  },
  render: function() {
    /*TODO: use identifiers, move styling to CSS file.*/
    var amountSpanStyle = {width: '5%', fontSize:'1.1em', paddingRight:'1%'};
    var amountInputStyle = {width: '95%'};

    var repeatSpanStyle = {width: '20%', fontSize:'1.1em', paddingRight:'1%'};
    var repeatInputStyle = {width: '20%'};

    var dateSpanStyle = {width: '15%', fontSize:'1.1em', paddingRight:'1%'};
    var dateInputStyle = {width: '85%'};

    var intervalSpanStyle = {width: '20%', fontSize:'1.1em', paddingRight:'1%'};
    var intervalInputStyle = {width: '20%'};
    return (
      <form className="ruleForm" onSubmit={this.handleSubmit}>
        <input type="hidden" value="1" ref="user" />
        <div>
          <input type="text" placeholder="Name" ref="name"/>
        </div>
        <div>
          <span style={amountSpanStyle}>$</span>
          <input style={amountInputStyle} type="text" placeholder="Amount" ref="amount"/>
        </div>
        <div>
          <CategorySelect ref="category"/>
        </div>
        <div>
          <span style={dateSpanStyle}>Start:</span>
          <input type="text" ref="start" style={dateInputStyle}/>
        </div>
        <div>
          <span style={repeatSpanStyle}>Repeat?</span>
          <input type="checkbox" ref="repeat" style={repeatInputStyle}/>
        </div>
          <span style={dateSpanStyle}>Repeats every</span>
          <IntervalSelector ref="interval"/><UnitSelector ref="unit"/>
        <div>
          <textarea placeholder="Notes . . ." ref="note" />
          </div>
        <div>
          <input type="submit" value="Add Rule" />
        </div>
      </form>
    );
  }
});

//TODO: Bind interval and unit selectors to the state of repeat checkbox?
// -> in that case, no need to submit checkbox, just look for interval/unit values in form data
var UnitSelector = React.createClass({
  render: function() {
    return (
      <select ref="unit" name="unit">
        <option value="days">Day(s)</option>
        <option value="weeks">Week(s)</option>
        <option value="months">Month(s)</option>
        <option value="years">Year(s)</option>
      </select>
      );
  }
});

var IntervalSelector = React.createClass({
  render: function() {
    // There has GOT to be a better way to populate this selector.
    var options = [];
    for (var i=1; i <=90; i++) {
      options.push({val:i});
    }
    options = options.map(function(option){
      return (
        <option key={option.val} value={option.val}>{option.val}</option>
        );
    });
    return (
        <select ref="interval" name="interval">
          {options}
        </select>
      );
  }
});

var CategorySelect = React.createClass({
  getInitialState: function() {
      return {data: []}
  },
  loadCategories: function() {
    this.props.url = "http://107.170.57.59:5000/categories/:json";
    $.ajax({
      url: this.props.url,
      dataType: 'text',
      success: function(data) {
        data = $.parseJSON(data);
        this.setState({data: data['categories']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCategories();
  },
  render: function() {
    var categoryOptions = this.state.data.map(function(category){
      return (
          <option key={category.id} value={category.id}>{category.name}</option>
        );
    });
    return (
      <select ref="category">
        {categoryOptions}
      </select>
      );
  }
});

React.render(
  <RuleBox
    ruleUrl="http://107.170.57.59:5000/rules%7Bid,name,amount,category.name%20:as%20category,category.type,start,interval,unit,note%7D/:json"
    apiUrl="http://107.170.57.59:5001/api/"
    pollInterval={30000}
    />,
  document.getElementById('content')
);

$(document).ready(function(){
  $('.date').datepicker({dateFormat: 'yy-mm-dd'});
});
