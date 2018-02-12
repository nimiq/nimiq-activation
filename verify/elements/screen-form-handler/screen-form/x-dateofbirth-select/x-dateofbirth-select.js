import XElement from '/libraries/x-element/x-element.js';

export default class XDateofbirthSelect extends XElement {
    html() {
        return `
            <input type="hidden">
            <select>
                <option value="">Year</option>
                <option>2018</option>
                <option>2017</option>
                <option>2016</option>
                <option>2015</option>
                <option>2014</option>
                <option>2013</option>
                <option>2012</option>
                <option>2011</option>
                <option>2010</option>
                <option>2009</option>
                <option>2008</option>
                <option>2007</option>
                <option>2006</option>
                <option>2005</option>
                <option>2004</option>
                <option>2003</option>
                <option>2002</option>
                <option>2001</option>
                <option>2000</option>
                <option>1999</option>
                <option>1998</option>
                <option>1997</option>
                <option>1996</option>
                <option>1995</option>
                <option>1994</option>
                <option>1993</option>
                <option>1992</option>
                <option>1991</option>
                <option>1990</option>
                <option>1989</option>
                <option>1988</option>
                <option>1987</option>
                <option>1986</option>
                <option>1985</option>
                <option>1984</option>
                <option>1983</option>
                <option>1982</option>
                <option>1981</option>
                <option>1980</option>
                <option>1979</option>
                <option>1978</option>
                <option>1977</option>
                <option>1976</option>
                <option>1975</option>
                <option>1974</option>
                <option>1973</option>
                <option>1972</option>
                <option>1971</option>
                <option>1970</option>
                <option>1969</option>
                <option>1968</option>
                <option>1967</option>
                <option>1966</option>
                <option>1965</option>
                <option>1964</option>
                <option>1963</option>
                <option>1962</option>
                <option>1961</option>
                <option>1960</option>
                <option>1959</option>
                <option>1958</option>
                <option>1957</option>
                <option>1956</option>
                <option>1955</option>
                <option>1954</option>
                <option>1953</option>
                <option>1952</option>
                <option>1951</option>
                <option>1950</option>
                <option>1949</option>
                <option>1948</option>
                <option>1947</option>
                <option>1946</option>
                <option>1945</option>
                <option>1944</option>
                <option>1943</option>
                <option>1942</option>
                <option>1941</option>
                <option>1940</option>
                <option>1939</option>
                <option>1938</option>
                <option>1937</option>
                <option>1936</option>
                <option>1935</option>
                <option>1934</option>
                <option>1933</option>
                <option>1932</option>
                <option>1931</option>
                <option>1930</option>
                <option>1929</option>
                <option>1928</option>
                <option>1927</option>
                <option>1926</option>
                <option>1925</option>
                <option>1924</option>
                <option>1923</option>
                <option>1922</option>
                <option>1921</option>
                <option>1920</option>
                <option>1919</option>
            </select>
            <select>
                <option value="">Month</option>
                <option value="01">Jan</option>
                <option value="02">Feb</option>
                <option value="03">Mar</option>
                <option value="04">Apr</option>
                <option value="05">May</option>
                <option value="06">Jun</option>
                <option value="07">Jul</option>
                <option value="08">Aug</option>
                <option value="09">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dec</option>
            </select>
            <select>
                <option value="">Day</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
                <option>24</option>
                <option>25</option>
                <option>26</option>
                <option>27</option>
                <option>28</option>
                <option>29</option>
                <option>30</option>
                <option>31</option>
            </select>
        `
    }

    onCreate() {
        this.$input = this.$('input');
        this.$$selects = this.$$('select');
        this.$year = this.$$selects[0];
        this.$month = this.$$selects[1];
        this.$day = this.$$selects[2];

        this.addEventListener('change', () => this._onChange());

        const name = this.$el.getAttribute('name');
        const required = this.$el.getAttribute('required');

        this.$input.setAttribute('name', name);

        this.$year.setAttribute('required', required);
        this.$month.setAttribute('required', required);
        this.$day.setAttribute('required', required);
    }

    _onChange() {
        this.$input.value = [this.$year.value, this.$month.value, this.$day.value].join('-');
    }
}