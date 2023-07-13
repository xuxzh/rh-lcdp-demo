import { Component } from '@angular/core';

@Component({
  selector: 'app-header-trade',
  templateUrl: './header-trade.component.html',
  styleUrls: ['./header-trade.component.less']
})
export class HeaderTradeComponent {
  tradeDataset = ['半导体行业', '汽配行业', '机加工行业', '家居行业'];
}
