import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

const BRAND = {
  instagram: '@joalheria.demo',
  phone: '(00) 00000-0000',
  city: 'SUA CIDADE',
};

function fmt(v: number | string | null | undefined): string {
  const n = Number(v ?? 0);
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('pt-BR');
}

@Injectable()
export class SalePdfService {
  async generate(sale: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const PW = doc.page.width;   // 595
      const ML = 40;               // margin left
      const MR = PW - 40;          // margin right

      // ── HEADER ─────────────────────────────────────────────────────
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#111')
        .text('Joalheria', ML, 40, { continued: false });

      doc.fontSize(8).font('Helvetica').fillColor('#444')
        .text('— j ó i a s —', ML, 72);

      // Center: Instagram + phone
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#111')
        .text(`Instagram  ${BRAND.instagram}`, ML + 120, 46)
        .font('Helvetica')
        .text(BRAND.phone, ML + 120, 60);

      // Right: date, Venda number, Vendedor
      const dateStr = fmtDate(sale.data ?? sale.createdAt);
      const vendaNum = sale.number;
      const vendedor = (sale.user?.name ?? '').toUpperCase();

      doc.fontSize(9).font('Helvetica').fillColor('#111')
        .text(dateStr, MR - 100, 40, { width: 100, align: 'right' });

      doc.fontSize(9).font('Helvetica-Bold')
        .text('Venda:', MR - 140, 54, { width: 55, align: 'right' })
        .font('Helvetica')
        .text(String(vendaNum), MR - 80, 54, { width: 80, align: 'right' });

      doc.fontSize(9).font('Helvetica-Bold')
        .text(`Vendedor: ${vendedor}`, MR - 200, 68, { width: 200, align: 'right' });

      // Divider
      const headerBottom = 92;
      doc.moveTo(ML, headerBottom).lineTo(MR, headerBottom).lineWidth(0.5).strokeColor('#ccc').stroke();

      // ── CLIENT ROW ─────────────────────────────────────────────────
      const clientY = headerBottom + 6;
      const customer = sale.customer;
      const clientName = customer?.name ?? 'BALCÃO';
      const clientPhone = customer?.phone ?? '';
      const clientAddress = customer?.address ?? BRAND.city;

      doc.rect(ML, clientY, MR - ML, 22).lineWidth(0.5).strokeColor('#999').stroke();

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#111')
        .text('CLIENTE:', ML + 4, clientY + 6, { continued: true })
        .font('Helvetica')
        .text(`  ${clientName}`, { continued: false });

      if (clientPhone) {
        doc.fontSize(9).font('Helvetica').fillColor('#111')
          .text(`Tel:  ${clientPhone}`, ML + 200, clientY + 6, { continued: false });
      }

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#111')
        .text(clientAddress.toUpperCase(), MR - 100, clientY + 6, { width: 100, align: 'right' });

      // ── TABLE HEADER ───────────────────────────────────────────────
      const tableTop = clientY + 28;
      const COL = {
        produto:   { x: ML,       w: 75  },
        descricao: { x: ML + 76,  w: 240 },
        qty:       { x: ML + 317, w: 50  },
        unit:      { x: ML + 368, w: 65  },
        total:     { x: ML + 434, w: MR - ML - 434 },
      };

      doc.rect(ML, tableTop, MR - ML, 18).fillAndStroke('#f0f0f0', '#999');

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#111');
      doc.text('PRODUTO',   COL.produto.x + 3,   tableTop + 5, { width: COL.produto.w });
      doc.text('DESCRIÇÃO', COL.descricao.x + 3, tableTop + 5, { width: COL.descricao.w });
      doc.text('QTD',       COL.qty.x,           tableTop + 5, { width: COL.qty.w, align: 'center' });
      doc.text('PR.UNIT',   COL.unit.x,          tableTop + 5, { width: COL.unit.w, align: 'right' });
      doc.text('TOTAL',     COL.total.x,         tableTop + 5, { width: COL.total.w, align: 'right' });

      // Vertical lines in header
      for (const x of [COL.descricao.x, COL.qty.x, COL.unit.x, COL.total.x]) {
        doc.moveTo(x - 1, tableTop).lineTo(x - 1, tableTop + 18).lineWidth(0.5).strokeColor('#999').stroke();
      }

      // ── TABLE ROWS ─────────────────────────────────────────────────
      let rowY = tableTop + 18;
      const ROW_H = 20;

      for (const item of sale.items ?? []) {
        const sku = item.product?.sku ?? '';
        const name = item.product?.name ?? '';
        const qty = item.quantity;
        const unitP = fmt(item.unitPrice);
        const total = fmt(item.total);

        doc.rect(ML, rowY, MR - ML, ROW_H).lineWidth(0.3).strokeColor('#ccc').stroke();

        doc.fontSize(8).font('Helvetica').fillColor('#111');
        doc.text(sku,    COL.produto.x + 3,   rowY + 6, { width: COL.produto.w - 3 });
        doc.text(name,   COL.descricao.x + 3, rowY + 6, { width: COL.descricao.w - 3 });
        doc.text(String(qty), COL.qty.x,      rowY + 6, { width: COL.qty.w, align: 'center' });
        doc.text(unitP,  COL.unit.x,          rowY + 6, { width: COL.unit.w, align: 'right' });
        doc.text(total,  COL.total.x,         rowY + 6, { width: COL.total.w, align: 'right' });

        rowY += ROW_H;
      }

      // Empty row padding (at least 3 empty rows visible)
      const minRows = 3;
      const existingRows = (sale.items ?? []).length;
      const emptyRows = Math.max(0, minRows - existingRows);
      for (let i = 0; i < emptyRows; i++) {
        doc.rect(ML, rowY, MR - ML, ROW_H).lineWidth(0.3).strokeColor('#ccc').stroke();
        rowY += ROW_H;
      }

      // ── OBS + TOTALS ───────────────────────────────────────────────
      const obsY = rowY + 4;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#111')
        .text('Obs. Venda:', ML, obsY);
      if (sale.notes) {
        doc.fontSize(8).font('Helvetica').fillColor('#444')
          .text(sale.notes, ML + 60, obsY);
      }

      // Totals box (right aligned)
      const TOT_X = MR - 150;
      const TOT_W = 150;
      const TOT_VAL_W = 60;
      const TOT_LABEL_W = TOT_W - TOT_VAL_W;

      const discount = Number(sale.discount ?? 0);
      const subtotal = Number(sale.total) + discount;
      const totals = [
        { label: 'SUBTOTAL:', value: fmt(subtotal) },
        { label: 'FRETE:',    value: '0,00' },
        { label: 'DESCONTO:', value: fmt(discount) },
        { label: 'TOTAL:',    value: fmt(sale.total) },
      ];

      let totY = rowY + 2;
      const TOT_ROW_H = 16;

      for (const t of totals) {
        const isTotal = t.label === 'TOTAL:';

        doc.rect(TOT_X, totY, TOT_LABEL_W, TOT_ROW_H)
          .lineWidth(0.5).strokeColor('#999').stroke();
        doc.rect(TOT_X + TOT_LABEL_W, totY, TOT_VAL_W, TOT_ROW_H)
          .lineWidth(0.5).strokeColor('#999').stroke();

        doc.fontSize(isTotal ? 9 : 8)
          .font(isTotal ? 'Helvetica-Bold' : 'Helvetica-Bold')
          .fillColor('#111')
          .text(t.label, TOT_X + 3, totY + 4, { width: TOT_LABEL_W - 6 });

        doc.fontSize(isTotal ? 9 : 8)
          .font(isTotal ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor('#111')
          .text(t.value, TOT_X + TOT_LABEL_W + 3, totY + 4, { width: TOT_VAL_W - 6, align: 'right' });

        totY += TOT_ROW_H;
      }

      // ── PAGE NUMBER ────────────────────────────────────────────────
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).font('Helvetica').fillColor('#aaa')
          .text(`${i + 1}`, ML, doc.page.height - 30, { width: MR - ML, align: 'right' });
      }

      doc.end();
    });
  }
}
