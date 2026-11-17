#!/usr/bin/env python3
"""Render the team contract Markdown as an A4 PDF using ReportLab."""
from pathlib import Path
from html import escape
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/team-contract.md'
OUTPUT = ROOT / 'output/pdf/team-contract.pdf'
PAGE_WIDTH, PAGE_HEIGHT = A4
WIDTH = PAGE_WIDTH - 36 * mm


def inline(text):
    text = escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    return text


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    for name in ('BodyText', 'Heading1', 'Heading2', 'Heading3'):
        styles[name].fontName = 'Helvetica' if name == 'BodyText' else 'Helvetica-Bold'
        styles[name].textColor = colors.HexColor('#20252b')
    styles['BodyText'].fontSize = 10
    styles['BodyText'].leading = 14
    styles['BodyText'].spaceAfter = 8
    styles['Heading1'].fontSize = 23
    styles['Heading1'].leading = 27
    styles['Heading1'].spaceAfter = 12
    styles['Heading2'].fontSize = 13
    styles['Heading2'].leading = 17
    styles['Heading2'].spaceBefore = 10
    styles['Heading2'].spaceAfter = 7
    styles['Heading3'].fontSize = 10.5
    styles['Heading3'].leading = 14
    styles['Heading3'].spaceBefore = 7
    styles['Heading3'].spaceAfter = 4
    cell = ParagraphStyle('Cell', parent=styles['BodyText'], fontSize=9,
                          leading=12, spaceAfter=0, alignment=TA_LEFT)
    story = []
    lines = SOURCE.read_text(encoding='utf-8').splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line == '<!-- pagebreak -->':
            story.append(PageBreak())
            i += 1
            continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                values = [v.strip() for v in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', v) for v in values):
                    rows.append(values)
                i += 1
            signatures = rows[0] == ['Member', 'Signature', 'Date']
            widths = [WIDTH * x for x in ([.28, .47, .25] if signatures else [.40, .60])]
            data = [[Paragraph(inline(v), cell) for v in row] for row in rows]
            table = Table(data, colWidths=widths, repeatRows=1,
                          minRowHeights=[0] + ([18*mm] * (len(rows)-1) if signatures else [0] * (len(rows)-1)))
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#edf0f2')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LINEBELOW', (0, 0), (-1, 0), .6, colors.HexColor('#aab2b8')),
                ('LINEBELOW', (0, 1), (-1, -1), .35, colors.HexColor('#d6dce0')),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 7),
                ('RIGHTPADDING', (0, 0), (-1, -1), 7),
            ]))
            story.extend([table, Spacer(1, 7)])
            continue
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            story.append(Paragraph(inline(line[level:].strip()), styles[f'Heading{min(level,3)}']))
            i += 1
            continue
        para = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(('#', '|', '<!--')):
            para.append(lines[i].strip())
            i += 1
        story.append(Paragraph(inline(' '.join(para)), styles['BodyText']))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#ccd2d7'))
        canvas.line(18*mm, 15*mm, PAGE_WIDTH-18*mm, 15*mm)
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#626c75'))
        canvas.drawString(18*mm, 10*mm, 'Group Internship | Team Contract | Draft 17 November 2026')
        canvas.drawRightString(PAGE_WIDTH-18*mm, 10*mm, str(doc.page))
        canvas.restoreState()

    doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18*mm,
                            rightMargin=18*mm, topMargin=17*mm, bottomMargin=22*mm,
                            title='Group Internship - Team Contract',
                            author='Group Internship team')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == '__main__':
    build()
